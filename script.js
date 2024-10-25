const openCameraButton = document.getElementById('openCamera');
const takePhotoButton = document.getElementById('takePhoto');
const toggleCameraButton = document.getElementById('toggleCamera');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
let stream;
let isUsingFrontCamera = false;

// Função para abrir a câmera
async function openCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: isUsingFrontCamera ? 'user' : 'environment' }
        });
        video.srcObject = stream;
        video.style.display = 'block';
        openCameraButton.style.display = 'none';
        takePhotoButton.style.display = 'block';
        toggleCameraButton.style.display = 'block';
        welcomeMessage.style.display = 'none';
    } catch (error) {
        console.error('Erro ao acessar a câmera: ', error);
    }
}

// Evento para abrir a câmera
openCameraButton.addEventListener('click', openCamera);

// Função para tirar a foto
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
    takePhotoButton.style.display = 'none';
    openCameraButton.style.display = 'block';
    toggleCameraButton.style.display = 'none';
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
    .then(response => response.json())
    .then(data => {
        console.log('Foto enviada com sucesso:', data);
    })
    .catch(error => {
        console.error('Erro ao enviar a foto:', error);
    });
}