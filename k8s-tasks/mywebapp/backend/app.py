from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import errno
from urllib.parse import quote

app = Flask(__name__, static_url_path='/static')
CORS(app)

# Placeholder for the uploaded images
uploaded_images_folder = '/app/data'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/multiple_images', methods=['POST', 'GET'])
def multiple_images():
    if request.method == 'POST':
        try:
            if 'images' in request.files:
                images = request.files.getlist('images')

                print('Number of files received:', len(images))

                for image in images:
                    image.save(os.path.join(uploaded_images_folder, image.filename))

                return jsonify(message=f'{len(images)} images uploaded successfully.')
            else:
                return jsonify(error='No images received.')

        except Exception as e:
            return jsonify(error=f'An error occurred during file upload: {str(e)}'), 500

    elif request.method == 'GET':
        try:
            # Provide a list of uploaded image filenames
            images = os.listdir(uploaded_images_folder)
            return jsonify(images)

        except FileNotFoundError:
            return jsonify(error='No images found.'), 404

        except OSError as e:
            # Handle other OS-level errors, like permission issues
            if e.errno == errno.EACCES:
                return jsonify(error='Permission denied during file retrieval.'), 403
            else:
                return jsonify(error=f'An error occurred during file retrieval: {str(e)}'), 500

@app.route('/api/download_image/<filename>', methods=['GET'])
def download_image(filename):
    try:
        # Use quote to properly encode the filename in the URL
        filename = quote(filename)
        return send_from_directory(uploaded_images_folder, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify(error=f'File {filename} not found.'), 404
    except Exception as e:
        return jsonify(error=f'An error occurred during file download: {str(e)}'), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

