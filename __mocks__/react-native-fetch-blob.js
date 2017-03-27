class RNFetchBlob {
  constructor() {
    this.fs = {
      files: {},
      dirs: {
        DocumentDir: '',
      },
      exists(file) {
        return new Promise((resolve, reject) => {
          if (this.files.hasOwnProperty(file)) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      },
      writeFile(path, data) {
        return new Promise((resolve, reject) => {
          this.files[path] = data;
          resolve(true);
        });
      },
      readFile(path) {
        return new Promise((resolve, reject) => {
          if (this.files.hasOwnProperty(path)) {
            resolve(this.files[path]);
          } else {
            reject(new Error('File not found!'));
          }
        });
      },
    };
  }
}

module.exports = new RNFetchBlob;
