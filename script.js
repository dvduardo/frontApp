const openCameraButton = document.getElementById('openCamera');
const takePhotoButton = document.getElementById('takePhoto');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

let stream;

// Função para abrir a câmera
openCameraButton.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        openCameraButton.style.display = 'none';
        takePhotoButton.style.display = 'block';
    } catch (error) {
        console.error('Erro ao acessar a câmera: ', error);
    }
});

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
});

// Função para enviar a foto para o servidor
function sendPhotoToServer(imageData) {
    fetch('https://seu-servidor.com/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Foto enviada com sucesso:', data);
    })
    .catch(error => {
        console.error('Erro ao enviar a foto:', error);
    });
}