window.onerror = function(msg, url, line) {
  const idx = url.lastIndexOf('/')
  if (idx > -1) url = url.substring(idx + 1)

  const message = 'ERROR in ' + url + ' (LINE #' + line + '): ' + msg
  if (window.Toast) {
    Toast.error(message)
  } else {
    alert(message)
  }
}

///////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////

const FILE_ICONS = {
  text:  ['ass', 'log', 'md', 'rss', 'srt', 'ssa', 'txt'],
  code:  ['as', 'asp', 'aspx', 'bat', 'c', 'cs', 'css', 'h', 'htm', 'html', 'ini', 'java', 'js', 'json', 'php', 'properties', 'py', 'reg', 'sh', 'sql', 'wxml', 'wxss', 'xhtml', 'xml'],
  image: ['bmp', 'cur', 'eps', 'gif', 'ico', 'jpe', 'jpg', 'jpeg', 'jpz', 'png', 'svg', 'tif', 'tiff'],
  audio: ['aac', 'aiff', 'ape', 'caf', 'flac', 'm3u', 'm4a', 'mp3', 'ogg', 'wav', 'wma'],
  video: ['3gp', 'asf', 'avi', 'flv', 'm3u8', 'm4u', 'm4v', 'mkv', 'mov', 'mp4', 'mpa', 'mpe', 'mpeg', 'mpg', 'ogm', 'rm', 'rmvb', 'vob', 'webm', 'wmv'],
  font:  ['eot', 'otf', 'ttf', 'woff', 'woff2'],
  doc: ['doc', 'docx'],
  ppt: ['ppt', 'pptx'],
  xls: ['xls', 'xlsx'],
  zip:   ['7z', 'gz', 'gzip', 'jar', 'rar', 'tar', 'z', 'zip'],
  '':    ['ai', 'apk', 'exe', 'pdf', 'psd', 'swf', 'torrent']
}

const PRISM_LANGUAGES = {
  as: 'actionscript',
  asp: 'aspnet',
  aspx: 'aspnet',
  bat: 'bash',
  sh: 'shell'
}

const SmbType = {
  FILE: 0,
  DIRECTORY: 1,
  SERVER: 4,
  SHARE: 8
}

const AscendSort = {
  name: true,
  size: false,
  lastModified: false
}

const Storage = {
  key: 'SAMBA_SERVER_STORAGE_KEY',

  save(obj) {
    localStorage.setItem(this.key, JSON.stringify(obj))
  },
  get() {
    return JSON.parse(localStorage.getItem(this.key)) || []
  },
  remove(index) {
    const servers = this.get()
    servers.splice(index, 1)
    this.save(servers)
  }
}

let entryStack = []
let currentPage = null

///////////////////////////////////////////////////////////
// Que Framework
///////////////////////////////////////////////////////////

new Que({
  data: {
    filelist: [],
    server: {},
    progress: '',
  },

  ready() {
    window.pullRefresh = new PullRefresh()
    window.textPage = Toast.page(document.querySelector('.text-page'))
    window.serverPage = Toast.page(document.querySelector('.server-page'))
    window.needFingerprint = document.querySelector('#needFingerprint')
    this._listServers()
  },

  onDeviceReady() {
    document.addEventListener('backbutton', () => this.onBack())
    pullRefresh.bind(document.querySelector('main'), () => {
      const currentEntry = entryStack[entryStack.length-1]
      if (currentEntry) {
        this._openDirectory(currentEntry)
      } else {
        this._listServers()
        pullRefresh.done()
      }
    })

    samba.onProgress = progress => {
      progress = parseInt(progress * 100)
      Toast.progress.tick(progress)
      this.progress = progress + '%'
      if (progress >= 100) this.progress = ''
    }
  },

  onOpen(e) {
    const index = e.currentTarget.dataset.index
    const entry = this.filelist[index]

    if (entry.isRoot) {
      samba.auth(entry.username, entry.password)

      if (entry.needFingerprint) {
        fingerprint.auth(() => this._openDirectory(entry, 1))
        return
      }
    }

    if (entry.type > 0) {
      this._openDirectory(entry, 1)
    } else {
      this._openFile(entry, e.currentTarget)
    }
  },

  _openDirectory(entry, direction = 0) {
    Toast.progress.start()
    samba.listEntries(entry.path, res => {
      this.filelist = res
      pullRefresh.done()
      Toast.progress.done()

      if (direction == 1) {
        entryStack.push(entry)
      } else
      if (direction == -1) {
        entryStack.pop()
      }
    }, err => {
      Toast.error(err)
      pullRefresh.done()
      Toast.progress.done()
    })
  },

  onBack() {
    if (Toast.current) {
      Toast.current.hide()
      return
    }
    if (currentPage) {
      currentPage.hide()
      currentPage = null
      return
    }
    if (entryStack.length == 1) {
      entryStack.pop()
      this._listServers()
      return
    }
    if (entryStack.length > 1) {
      const parentEntry = entryStack[entryStack.length-2]
      this._openDirectory(parentEntry, -1)
      return
    }
    samba.runBackground()
  },

  onStatusTop() {
    const main = document.querySelector('main')
    main.scrollTop = 0
  },

  onSaveServer() {
    if (!this.server.name) {
      return Toast.error('??????????????????')
    }
    if (!this.server.host) {
      return Toast.error('?????????/IP????????????')
    }

    const host = this._parseHost(this.server.host)
    this.server.type = host.type
    this.server.path = host.path
    this.server.needFingerprint = needFingerprint.checked
    this.server.isRoot = true

    const index = this.server.index
    if (index !== undefined) {
      delete this.server.index
      this.filelist.splice(index, 1, Object.assign({}, this.server))
    } else {
      this.filelist.push(this.server)
    }

    this._sortList('name', true)
    Storage.save(this.filelist)
    this.onBack()
    Toast.success('????????????')
  },

  _parseHost(host) {
    let path, subpath = ''
    if (!host.endsWith('/')) {
      path = host + '/'
    }
    if (host.indexOf('/') > -1) {
      subpath = host.substring(host.indexOf('/') + 1)
    }
    return {
      type: subpath ? SmbType.SHARE : SmbType.SERVER,
      path: 'smb://' + path
    }
  },

  _listServers() {
    this.filelist = Storage.get()
    if (this.filelist.length == 0) {
      Toast.info("?????????????????????")
    }
  },

  /////////////////////////////////////////////////////////
  // Create entry actions
  /////////////////////////////////////////////////////////

  onAdd() {
    const menus = [{
      label: '???????????????',
      onClick: () => {
        this.server = {}
        needFingerprint.checked = false
        currentPage = serverPage.show()
      }
    }]

    const currentEntry = entryStack[entryStack.length-1]
    if (currentEntry && (currentEntry.type == SmbType.SHARE
      || currentEntry.type == SmbType.DIRECTORY)) {
      menus.unshift({
        label: '????????????',
        onClick: () => {
          navigator.camera.getPicture(uri => this._upload(uri, currentEntry.path), null, {
            quality: 100,
            mediaType: Camera.MediaType.ALLMEDIA,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.FILE_URI
          })
        }
      }, {
        label: '??????????????????',
        onClick: () => {
          samba.createFile(currentEntry.path + '??????????????????.txt', entry => {
            this.filelist.push(entry)
            Toast.success('????????????')
          }, err => {
            Toast.error(err)
          })
        }
      }, {
        label: '???????????????',
        onClick: () => {
          samba.createDirectory(currentEntry.path + '???????????????/', entry => {
            this.filelist.push(entry)
            Toast.success('????????????')
          }, err => {
            Toast.error(err)
          })
        }
      })
    }

    Toast.actionSheet(menus)
  },

  _upload(uri, path) {
    Toast.progress.start(false)
    samba.upload(uri, path, entry => {
      this.filelist.push(entry)
      Toast.success('????????????')
      Toast.progress.done()
    }, err => {
      Toast.error(err)
      Toast.progress.done()
    })
  },

  /////////////////////////////////////////////////////////
  // Single entry actions
  /////////////////////////////////////////////////////////

  onAction(e) {
    navigator.vibrate(50)
    const index = e.currentTarget.dataset.index
    const entry = this.filelist[index]
    if (!entry.isRoot && entry.type == SmbType.SHARE) {
      return
    }

    const menus = [{
      label: '??????',
      onClick: () => {
        Toast.confirm('??????????????????????????????????????????', () => {
          if (entry.isRoot) {
            Storage.remove(index)
            this.filelist.splice(index, 1)
            Toast.success('????????????')
          } else {
            samba.delete(entry.path, () => {
              this.filelist.splice(index, 1)
              Toast.success('????????????')
            }, err => {
              Toast.error(err)
            })
          }
        })
      }
    }]

    if (entry.isRoot) {
      menus.unshift({
        label: '????????????',
        onClick: () => {
          samba.wakeOnLan(entry.mac, parseInt(entry.port) || 0, res => {
            Toast.success('????????????')
          }, err => {
            Toast.error(err)
          })
        }
      }, {
        label: '??????',
        onClick: () => {
          entry.index = index
          if (entry.needFingerprint) {
            fingerprint.auth(() => this._editServer(entry))
          } else {
            this._editServer(entry)
          }
        }
      })
    } else
    if (entry.type == SmbType.FILE) {
      menus.unshift({
        label: '??????',
        onClick: () => {
          Toast.progress.start(false)
          samba.download(entry.path, localPath => {
            Toast.success('???????????????' + localPath)
            Toast.progress.done()
          }, err => {
            Toast.error(err)
            Toast.progress.done()
          })
        }
      })
    }

    Toast.actionSheet(menus)
  },

  _editServer(entry) {
    this.server = Object.assign({}, entry)
    needFingerprint.checked = entry.needFingerprint
    currentPage = serverPage.show()
  },

  _openFile(file, el) {
    file.icon = this.getFileIcon(file.ext)
    if (file.icon == 'text' || file.icon == 'code') {
      this._openText(file)
    } else
    if (file.icon == 'image') {
      samba.openImage(file.path)
    } else
    if (file.icon == 'video' || file.icon == 'audio') {
      samba.openMedia(file.path)
    } else {
      samba.openFile(file.path)
    }
  },

  /////////////////////////////////////////////////////////
  // Filelist sort actions
  /////////////////////////////////////////////////////////

  onSort() {
    Toast.actionSheet([{
      label: '??????????????????',
      onClick: () => this._reverseList('name')
    }, {
      label: '???????????????',
      onClick: () => this._reverseList('lastModified')
    }, {
      label: '???????????????',
      onClick: () => this._reverseList('size')
    }])
  },

  _reverseList(key) {
    AscendSort[key] = !AscendSort[key]
    this._sortList(key, AscendSort[key])
    Toast.info(AscendSort[key] ? '????????????' : '????????????')
  },

  _sortList(key, order) {
    this.filelist.sort(function(a, b) {
      if (order) {
        return a[key] > b[key] ? 1 : -1
      } else {
        return a[key] < b[key] ? 1 : -1
      }
    })
  },

  /////////////////////////////////////////////////////////
  // File viewer
  /////////////////////////////////////////////////////////

  _openText(file) {
    const title = textPage.querySelector('.appname')
    const content = textPage.querySelector('.content')
    title.textContent = file.name
    content.innerHTML = ''
    currentPage = textPage.show()

    if (file.icon == 'text') {
      content.addClass('break-word')
    } else {
      content.removeClass('break-word')
    }

    Toast.progress.start()
    samba.readAsText(file.path, text => {
      Toast.progress.done()
      const lang = PRISM_LANGUAGES[file.ext] || file.ext
      if (Prism.languages[lang]) {
        content.innerHTML = Prism.highlight(text, Prism.languages[lang])
      } else {
        content.innerHTML = text
      }
    })
  },

  /////////////////////////////////////////////////////////
  // Utils
  /////////////////////////////////////////////////////////

  getFileIcon(ext) {
    let fileIcon = 'unknown'
    for (let key in FILE_ICONS) {
      if (FILE_ICONS[key].includes(ext)) {
        fileIcon = key
        break
      }
    }
    return fileIcon || ext
  },

  formatTime(time) {
    if (!time) return
    const date = new Date(time + 8 * 3600 * 1000) // ????????????????????????8??????
    return date.toJSON().substr(0, 16).replace('T', ' ')
  },

  formatSize(size) {
    if (size > 1024*1024*1024) return (size / 1024 / 1024 / 1024).toFixed(2) + 'G'
    if (size > 1024*1024) return (size / 1024 / 1024).toFixed(2) + 'M'
    if (size > 1024) return (size / 1024).toFixed(1) + 'K'
    return size ? size + 'B' : ''
  }

})

///////////////////////////////////////////////////////////
// Directive Registration
///////////////////////////////////////////////////////////

Que.directive('hammer.press', (element, callback) => {
  const hammer = new Hammer(element)
  hammer.get("press").set({ time: 500 })
  hammer.on('press', callback)
})
