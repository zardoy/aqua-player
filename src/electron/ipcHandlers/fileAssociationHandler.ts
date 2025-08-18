import { app } from 'electron';
import { Registry } from 'rage-edit';
import { VIDEO_EXTENSIONS, APP_NAME, APP_ID } from '../../shared/constants';
import { AppSettings } from '../../shared/settingsDefinitions';

export async function setupWindowsFileAssociations(settings: AppSettings) {
    if (process.platform !== 'win32') return;
    if (!settings.app__enableFileAssociations) {
        await removeWindowsFileAssociations();
        return;
    }

    try {
        // Set up basic application information
        await Registry.set(`HKCU\\Software\\${APP_ID}\\Capabilities`, 'ApplicationName', APP_NAME);
        await Registry.set(`HKCU\\Software\\${APP_ID}\\Capabilities`, 'ApplicationDescription', 'Modern video player for local files');

        // Set up file associations for each video format
        for (const ext of VIDEO_EXTENSIONS) {
            const extWithoutDot = ext.substring(1); // Remove the dot

            // Register file type capabilities
            await Registry.set(
                `HKCU\\Software\\${APP_ID}\\Capabilities\\FileAssociations`,
                ext,
                `${APP_ID}.${extWithoutDot}`
            );

            // Set up the application registration
            await Registry.set(
                `HKCU\\Software\\Classes\\${APP_ID}.${extWithoutDot}`,
                '',
                `${APP_NAME} ${extWithoutDot.toUpperCase()} File`
            );

            // Set the icon
            await Registry.set(
                `HKCU\\Software\\Classes\\${APP_ID}.${extWithoutDot}\\DefaultIcon`,
                '',
                `"${process.execPath}",0`
            );

            // Set the command to open files
            await Registry.set(
                `HKCU\\Software\\Classes\\${APP_ID}.${extWithoutDot}\\shell\\open\\command`,
                '',
                `"${process.execPath}" "%1"`
            );

            // Add to OpenWithProgids
            await Registry.set(
                `HKCU\\Software\\Classes\\${ext}\\OpenWithProgids`,
                `${APP_ID}.${extWithoutDot}`,
                ''
            );
        }

        // Register the application in Windows
        await Registry.set(
            'HKCU\\Software\\RegisteredApplications',
            APP_ID,
            `Software\\${APP_ID}\\Capabilities`
        );

        return true;
    } catch (error) {
        console.error('Failed to set up file associations:', error);
        return false;
    }
}

export async function removeWindowsFileAssociations() {
    if (process.platform !== 'win32') return;

    try {
        // Remove file associations
        for (const ext of VIDEO_EXTENSIONS) {
            const extWithoutDot = ext.substring(1);

            // Remove from OpenWithProgids
            await Registry.delete(
                `HKCU\\Software\\Classes\\${ext}\\OpenWithProgids`,
                `${APP_ID}.${extWithoutDot}`
            ).catch(() => {});

            // Remove file type registration
            await Registry.delete(
                `HKCU\\Software\\Classes\\${APP_ID}.${extWithoutDot}`
            ).catch(() => {});
        }

        // Remove application registration
        await Registry.delete(`HKCU\\Software\\${APP_ID}`).catch(() => {});
        await Registry.delete(
            'HKCU\\Software\\RegisteredApplications',
            APP_ID
        ).catch(() => {});

        return true;
    } catch (error) {
        console.error('Failed to remove file associations:', error);
        return false;
    }
}
