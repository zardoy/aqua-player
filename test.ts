import mpvAPI from 'node-mpv';

// where you want to initialise the API
const mpv = new mpvAPI({
    binary: '/Users/vit/Downloads/mpv-arm64-0.40.0/mpv.app/Contents/MacOS/mpv',
    audio_only: true,
});

// somewhere within an async context
// starts MPV
mpv.start().then(async () => {
    // get the MPV version
    await mpv.load('/Users/vit/Downloads/Resident.Alien.S04.WEBDL.1080p/Resident.Alien.S04E01.WEBDL.1080p.RGzsRutracker.mkv');
    // mpv.volume(80)
    // mpv.start()
    mpv.getMetadata().then(console.log)
})
