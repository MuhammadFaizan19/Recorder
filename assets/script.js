/* eslint-disable no-console */
/* eslint-disable require-jsdoc */
const videoEl = document.querySelector('.video');
const audioEl = document.querySelector('.audio');
const screenEl = document.querySelector('.screen');
const recorders = document.querySelectorAll('.recorder');
const buttons = document.querySelectorAll('button');

function display() {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', () => {
            videoEl.style.display = 'none';
            audioEl.style.display = 'none';
            screenEl.style.display = 'none';
            $('#alertMessage').empty();
            $('#alertMessage').hide();
            switch (i) {
                case 0:
                    audioEl.appendChild(audioappend);
                    a();
                    audioEl.style.display = 'block';
                    break;
                case 1:
                    videoEl.style.display = 'block';
                    break;
                case 2:
                    screenEl.style.display = 'block';
                    break;
                default:
                    break;
            }
        });
    }
}

//**************************************FOR AUDIO RECORDING************************************

//**************************************FOR AUDIO RECORDING************************************
let audioappend = document.createElement("audio");
audioappend.setAttribute("id", "recordAudio");
audioappend.setAttribute("class", "recorder video-js vjs-default-skin");
const audioConfig = {
    controls: true,
    bigPlayButton: false,
    fullscreenToggle: false,
    width: 600,
    height: 600,
    fluid: false,
    plugins: {
        wavesurfer: {
            backend: "WebAudio",
            waveColor: "#36393b",
            progressColor: "black",
            debug: true,
            cursorWidth: 5,
            hideScrollbar: true,
            plugins: [
                // enable microphone plugin
                WaveSurfer.microphone.create({
                    bufferSize: 4096,
                    numberOfInputChannels: 1,
                    numberOfOutputChannels: 1,
                    constraints: {
                        video: false,
                        audio: true,
                    },
                }),
            ],
        },
        record: {
            audio: true,
            video: false,
            maxLength: 20,
            displayMilliseconds: true,
            debug: true,
        },
    },
};
applyAudioWorkaround();
applyVideoWorkaround();
applyScreenWorkaround();
//For recording Audio only
function a(){
    const audio = videojs('recordAudio', audioConfig);

    audio.on('deviceError', () => {
        console.log('device error:', audio.deviceErrorCode);
    });
    
    audio.on('ready', () => {
        // audio.record().getDevice();
    });
    audio.on('error', (element, error) => {
        console.error(error);
    });
    audio.on('startRecord', () => {
        console.log('started recording Audo!');
        audioSegmentNumber = 0;
    });
    audio.on('finishRecord', () => {
        console.log('finished recording Audio: ', audio.recordedData);
        uploadData(audio.recordedData);
    });
}
//For recording Audio only


$('#audioButton').on('click', ()=>{
    $('.vjs-icon-audio-perm').trigger("click");
    $('.audio').show();
});


//**************************************END FOR AUDIO RECORDING************************************

//**************************************FOR VIDEO RECORDING************************************
const videoConfig = {
    controls: true,
    width: 720,
    height: 480,
    fluid: false,
    plugins: {
        record: {
            audio: true,
            video: true,
            maxLength: 600,
            debug: true,
            videoMimeType: "video/webm"
        }
    }
};
const video = videojs("recordVideo", videoConfig );
video.on('deviceError', () => {
    console.log('device error:', video.deviceErrorCode);
    alert('device error:', video.deviceErrorCode);

});
video.on('error', (error) => {
    console.log('error:', error);
});

video.on('startRecord', () => {
    console.log('started recording! Do whatever you need to');
});

video.on('finishRecord', () => {
    console.log('finished recording video: ', video.recordedData);
    uploadData(video.recordedData);

});

$('#videoButton').on('click', ()=>{
    $('.vjs-icon-av-perm').trigger("click");
});
//**************************************END FOR VIDEO RECORDING************************************


//**************************************FOR SCREEN RECORDING************************************
const screenConfig = {
    controls: true,
    fluid: false,
    bigPlayButton: false,
    controlBar: {
        volumePanel: false,
        fullscreenToggle: false
    },
    plugins: {
        record: {
            maxLength: 300,
            screen: true,
            displayMilliseconds: false
        }
    }
};
const screen = videojs('recordScreen', screenConfig);
screen.on('deviceError', () => {
    console.warn('device error:', screen.deviceErrorCode);
});
screen.on('error', (element, error) => {
    console.error(error);
});
screen.on('finishRecord', () => {
    console.log('screen recording ready: ', screen.recordedData);
    uploadData(screen.recordedData);
});
$('#screenButton').on('click', ()=>{
    $('.vjs-icon-screen-perm').trigger("click");
});
//**************************************END FOR SCREEN RECORDING************************************

display();

const uploadData = async (blobData) => {
    uploadToCloudinary(blobData);
};

const convertToBase64 = async (data) => {
    let reader = new FileReader();
    reader.readAsDataURL(data);
    return await new Promise((resolve)=>{
        reader.onloadend = () => {
            const base64data = reader.result;
            console.log('convertedToBase64', base64data);
            resolve(base64data);
        };
    });
};

const uploadToCloudinary = (data) => {
    $('#alertMessage').append( "<label>Uploading Started. Please Wait...!</label>" ).show('');
    const cloudinaryUserName = 'yourUserName';
    const uploadPreset = 'ForUnsignedUpload';
    const fd = new FormData();
    fd.append("file", data, data.name);
    fd.append("upload_preset", uploadPreset);
    fd.append("resource_type", "video");

    $.ajax({
        url: `https://api.cloudinary.com/v1_1/${cloudinaryUserName}/upload`,
        method: 'POST',
        data: fd,
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            console.log("data uploaded: " + res);
            $('#alertMessage').empty();
            $('#alertMessage').append( `<label>Uploading Finished. Asset details: ${JSON.stringify(res)}</label>` ).show('');

        },
        error: function(err) {
            console.log("data upload error: " + err);
            $('#alertMessage').empty();
            $('#alertMessage').append( `<label>Error uploading file, please try again!</label>` ).show('');
        }
    });

    setTimeout(()=> {
        $('#alertMessage').empty();
        $('#alertMessage').hide();
    }, 8000);
};

/*
{"asset_id":"d36b4d6d47f1562f9852adfe7d755a60","public_id":"vfc6lfcf3fgpiymidpc2","version":1610823951,"version_id":"3568b177d56a6c4b18568a40e9094524","signature":"e14809225430812e2bc54cad9ce1980b72c8b807","width":0,"height":0,"format":"webm","resource_type":"video","created_at":"2021-01-16T19:05:51Z","tags":[],"pages":0,"bytes":9142,"type":"upload","etag":"e396ec001730c966ef15a466339441a7","placeholder":false,"url":"http://res.cloudinary.com/test2112/video/upload/v1610823951/vfc6lfcf3fgpiymidpc2.webm","secure_url":"https://res.cloudinary.com/test2112/video/upload/v1610823951/vfc6lfcf3fgpiymidpc2.webm","audio":{"codec":"opus","frequency":48000,"channels":1,"channel_layout":"mono"},"video":{},"is_audio":true,"duration":1.739,"original_filename":"1610823950313"}
*/