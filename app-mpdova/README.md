```
npm install -g cordova
cordova create app-mpdova
cd app-mpdova

cordova platform add browser
cordova platform add android

# cordova plugin add cordova-plugin-dialogs
# cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-vibration
cordova plugin add https://github.com/metadream/cordova-plugin-mpc

cordova run browser
cordova run android

cordova build
```

```
yum -y install node
npm -g install n
n latest

vi ~/.bash_profile
export N_PREFIX=/usr/local/bin/node
export PATH=$N_PREFIX/bin:$PATH

source ~/.bash_profile
```
