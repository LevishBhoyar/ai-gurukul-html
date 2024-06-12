/*
Reference : https://youtu.be/kifVHJxLr7w?si=_lE1UL-IfDr8i1ef (s3 bucket)
*/

// Variable to track configuratuon of aws
let isConfigUpdate = false;

let reader = new FileReader();

// Function to upload file to an S3 bucket
async function uploadToS3Bucket(stream, credential, cd) {
    try {
        if (!window.AWS) {
            return;
        }

        if (!isConfigUpdate) {
            window.AWS.config.update({ region: credential.region });
            isConfigUpdate = true;
        }

        // Create S3 object
        let s3 = new window.AWS.S3({
            credentials: new window.AWS.Credentials({
                accessKeyId: credential.accessKeyId,
                secretAccessKey: credential.secretAccessKey,
                signatureVersion: credential.signatureVersion
            }),
            region: credential.region
        });

        // file name to be uploaded
        const fileName = document.getElementById("fileToUpload").files[0].name;

        // Uploading the files
        let uploadItem = await s3.upload({
            Bucket: credential.Bucket,
            Key: fileName, 
            ContentType: document.getElementById("fileToUpload").files[0].type,
            Body: stream
        }).on("httpUploadProgress", function (progress) {
            console.log("progress=>", progress);
            cd(getUploadingProgress(progress.loaded, progress.total));
        }).promise();

        console.log("uploadItem=>", uploadItem);
        return uploadItem;
    } catch (error) {
        console.log(error);
    }
}

// Calculation of uploaded percentage
function getUploadingProgress(uploadSize, totalSize) {
    let uploadProgress = (uploadSize / totalSize) * 100;
    return Number(uploadProgress.toFixed(0));
}

// Function to uplaod the files
async function uploadMedia() {
    let credentialRequest = {
        accessKeyId: '', 
        secretAccessKey: '',
        signatureVersion: 'v4',
        region: '',
        Bucket: '' 
    };

    let mediaStreamRequest = getFile(document.getElementById("fileToUpload").files[0]);
    const [mediaStream] = await Promise.all([mediaStreamRequest]);
    await uploadToS3Bucket(mediaStream, credentialRequest, (progress) => {
        console.log(progress);
    });
}

// ReadFile from the buffer
async function getFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (err) => {
            reject(false);
        };
        reader.readAsArrayBuffer(file);
    });
}

async function fetchPostAsyncAwaitMethod(argument) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const res = await response.json();
        console.log(res, "post fetch");
        
        if (response.status === 200) {
            const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${res[0].id}`);
            const resCon = await response.json();
            console.log(resCon, "comment fetch");
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch posts using dot then method
function fetchPostDotThenMethod(argument) {
    fetch('https://jsonplaceholder.typicode.com/posts')
        .then((res) => res.json())
        .then(res => {
            console.log(res, 'post fetch');
            if (res.length > 0) {
                fetch(`https://jsonplaceholder.typicode.com/comments?postId=${res[0].id}`)
                    .then((res) => res.json())
                    .then(res => {
                        console.log(res, 'comment fetch');
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }).catch(error => {
            console.log(error);
        });
}

// Fetch posts using callback method
function fetchPostCallBackMethod() {
    function fetchPostComment(id) {
        fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`)
            .then((res) => res.json())
            .then(res => {
                console.log(res, 'fetchPostComment');
            }).catch(error => {
                console.log(error);
            });
    }

    function fetchPost(callback) {
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then((res) => res.json())
            .then(res => {
                if (res.length > 0) {
                    console.log(res, 'fetchPost');
                    callback(res[0].id);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    fetchPost(fetchPostComment);
}

fetchPostAsyncAwaitMethod();
