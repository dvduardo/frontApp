const openCameraButton = document.getElementById('open-camera');
const viewPhotosButton = document.getElementById('view-photos');
const takePhotoButton = document.getElementById('take-photo');
const toggleCameraButton = document.getElementById('toggle-camera');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const camera = document.getElementById('camera');
const preview = document.getElementById('preview');
const gallery = document.getElementById('gallery');
const photos = document.getElementById('gallery-photos');
const previewBack = document.getElementById('preview-back');
const cameraBack = document.getElementById('camera-back');
const galleryBack = document.getElementById('gallery-back');
const previewClose = document.getElementById('preview-close');
const sendSuccess = document.getElementById('send-success');
let stream;
let isUsingFrontCamera = false;

async function openCamera() {
    stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isUsingFrontCamera ? 'user' : 'environment' }
    });
    video.srcObject = stream;
    camera.style.display = 'block';
}

async function openGallery() {
    const response = await fetch('https://mole-star-feline.ngrok-free.app/fotos');
    const res = await response.json();
    const uuids = res.fotos;

    photos.innerHTML = '';
    gallery.style.display = 'block';
    for (const uuid of uuids) {
        const div = document.createElement('div');
        const img = document.createElement('img');
        img.src = `https://mole-star-feline.ngrok-free.app/${uuid}`;
        div.classList.add('gallery__photo');

        img.addEventListener('click', () => {
            window.open(`https://mole-star-feline.ngrok-free.app/${uuid}`, '_blank');
        });
        div.appendChild(img);
        photos.appendChild(div);
    }
}

function closeAll() {
    camera.style.display = 'none';
    preview.style.display = 'none';
    gallery.style.display = 'none';
    sendSuccess.style.display = 'none';
}

previewBack.addEventListener('click', closeAll);
cameraBack.addEventListener('click', closeAll);
galleryBack.addEventListener('click', closeAll);
previewClose.addEventListener('click', closeAll);

viewPhotosButton.addEventListener('click', wrapError(openGallery));
openCameraButton.addEventListener('click', wrapError(openCamera));

takePhotoButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter a imagem para base64
    const imageData = canvas.toDataURL('image/png');

    // Enviar a imagem para o servidor
    sendPhotoToServer(imageData);

    // Parar o stream da câmera
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    camera.style.display = 'none';
    preview.style.display = 'block';
});

// Função para alternar a câmera
toggleCameraButton.addEventListener('click', () => {
    // Alterna entre a câmera frontal e traseira
    isUsingFrontCamera = !isUsingFrontCamera;

    // Parar o stream atual
    stream.getTracks().forEach(track => track.stop());

    // Reabrir a câmera com o novo lado
    openCamera();
});

// Função para converter dataURI para Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Função para enviar a foto para o servidor
function sendPhotoToServer(imageData) {
    const formData = new FormData();
    formData.append('foto_file', dataURItoBlob(imageData), 'photo.png');

    fetch('https://mole-star-feline.ngrok-free.app/', {
        method: 'POST',
        headers: {
            'accept': 'application/json'
        },
        body: formData
    })
    .then(() => {
        sendSuccess.style.display = 'block';
        console.log('Foto enviada com sucesso');
    })
    .catch(error => {
        console.error('Erro ao enviar a foto:', error);
    });
}

function wrapError(fn) {
    return async () => {
        try {
            await fn();
        } catch (error) {
            console.error('Erro:', error);
        }
    };
}
