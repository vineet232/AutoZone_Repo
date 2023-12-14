document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for file input change
    var imageUploadInput = document.getElementById('image-upload');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', handleImageUpload);
    }

    // Add event listener for "Choose Images" button click
    var uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
        uploadButton.addEventListener('click', function () {
            // Create a new file input element
            var newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.accept = 'image/*';
            newInput.style.display = 'none';

            // Append the new input to the document
            document.body.appendChild(newInput);

            // Add an event listener to the new input
            newInput.addEventListener('change', function () {
                // Remove the new input from the document
                document.body.removeChild(newInput);

                // Handle the change event as before
                handleImageUpload.apply(imageUploadInput, arguments);
            });

            // Trigger a click event on the new input
            newInput.click();
        });
    }

    // Fetch the list of uploaded images and display thumbnails
    fetch('/api/multiple_images')
        .then(response => response.json())
        .then(images => displayImageThumbnails(images))
        .catch(error => console.error('Error fetching images:', error));
});


function handleImageUpload(event) {
    const input = event.target;
    const files = input.files;

    if (files.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i], files[i].name);
        }

        const progressBar = document.getElementById('upload-progress');
        progressBar.value = 0;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/multiple_images', true);

        xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
                const percentage = (e.loaded / e.total) * 100;
                progressBar.value = percentage;
            }
        });

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Handle the response from the server
                    alert(JSON.parse(xhr.responseText).message);

                    // Fetch the updated list of uploaded images and display thumbnails
                    fetch('/api/multiple_images')
                        .then(response => response.json())
                        .then(images => displayImageThumbnails(images))
                        .catch(error => console.error('Error fetching images:', error));
                } else {
                    alert('Failed to upload images.');
                }
            }
        };

        xhr.send(formData);
    } else {
        alert('Please select one or more images to upload.');
    }
}


function downloadImage() {
    // Get all checkboxes that are checked
    const checkboxes = document.querySelectorAll('.thumbnail-checkbox:checked');

    if (checkboxes.length > 0) {
        // Get the filenames of the selected images
        const selectedImages = Array.from(checkboxes).map(checkbox => checkbox.value);

        // Use the Fetch API to download the selected images from the server
        selectedImages.forEach(image => {
            const url = `/api/download_image/${encodeURIComponent(image)}`;
            const a = document.createElement('a');
            a.href = url;
            a.download = image; // Use the image's filename for download
            a.target = '_blank'; // Open a new tab/window for the download
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    } else {
        alert('Please select at least one image to download.');
    }
}




function displayImageThumbnails(images) {
    const thumbnailsContainer = document.getElementById('thumbnails-container');

    // Clear existing thumbnails
    thumbnailsContainer.innerHTML = '';

    // Loop through image filenames and create thumbnail elements
    images.forEach(function (filename) {
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'thumbnail-container';

        const thumbnail = document.createElement('img');
        thumbnail.src = `/api/download_image/${encodeURIComponent(filename)}`;
        thumbnail.alt = filename;
        thumbnail.className = 'thumbnail';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = filename;
        checkbox.className = 'thumbnail-checkbox';

        thumbnailContainer.appendChild(thumbnail);
        thumbnailContainer.appendChild(checkbox);

        // Append thumbnail container to the existing thumbnails
        thumbnailsContainer.appendChild(thumbnailContainer);
    });
}

    

fetch('/api/multiple_images')
    .then(response => response.json())
    .then(images => {
        console.log('Received images:', images);
        displayImageThumbnails(images);
    })
    .catch(error => console.error('Error fetching images:', error));


