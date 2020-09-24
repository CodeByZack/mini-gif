export const readFile = (file)=>{
    return new Promise((resolve,reject)=>{
        const fileReader = new FileReader();
        fileReader.onload = ((e)=>{
            resolve(e.target.result);
        });
        fileReader.onerror = ((err)=>{
            reject(err);
        });
        fileReader.onabort = ((err)=>{
            reject(err);
        });
        fileReader.readAsArrayBuffer(file);
    });
};