import { autoUpdater } from 'electron-updater'
import { settingsMain } from '../ipcHandlers/settingsHandlers'
import electronLogger from 'electron-log'

if (settingsMain.app__autoUpdate) {
    autoUpdater.allowDowngrade = true
    autoUpdater.logger = electronLogger
    electronLogger.info('auto updater enabled', {
        currentVersion: autoUpdater.currentVersion
    })
    autoUpdater.checkForUpdates().then((result) => {
        if (result.isUpdateAvailable) {
            electronLogger.info('found update', {
                updateInfo: result.updateInfo,
            })
        }
    })
}
