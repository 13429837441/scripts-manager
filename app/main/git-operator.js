const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const { app, shell, dialog } = require('electron');
const os = require('os');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const AdmZip = require('adm-zip');

class GitOperator {
  constructor() {
    // 在便携版中使用用户目录存储数据
	const userDataPath = app.getPath('userData') || path.join(os.homedir(), '.script-manager');
	this.dataFile = path.join(userDataPath, 'encrypt.json');
	this.ensureDataFile();
	// 密钥和数据
	this.secretKey = '8VBkO5amPcPrXV3n';
	this.iv = CryptoJS.enc.Utf8.parse('1122334455667788'); // 16 字节 IV, 可自定义配置
	// GitHub API地址
	this.GITHUB_API = 'https://api.github.com';
	this.GITHUB_LOAD = 'https://raw.githubusercontent.com';
  }

  async ensureDataFile() {
    try {
      // 确保数据目录存在
      const dataDir = path.dirname(this.dataFile);
      await fsPromises.mkdir(dataDir, { recursive: true });

      // 检查数据文件是否存在
      try {
        await fsPromises.access(this.dataFile);
      } catch (error) {
        // 文件不存在，创建初始数据
		await this.createInitialData();
      }
    } catch (error) {
      console.error('初始化数据文件失败:', error);
    }
  }
  
  async createInitialData() {
    console.log('GitOperator: 创建初始脚本数据...');
	
    // 便携版不包含示例脚本，创建空的脚本列表
    const initialencrypts = [];

    try {
      await fsPromises.writeFile(this.dataFile, JSON.stringify(initialencrypts, null, 2), 'utf8');
      console.log('GitOperator: 已成功创建初始设置数据');
    } catch (error) {
      console.error('GitOperator: 写入初始数据失败:', error.message);
      throw error;
    }
  }
  
  async getEncrypts() {
    try {
	  console.log('GitOperator: 开始读取配置文件:', this.dataFile);
      const data = await fsPromises.readFile(this.dataFile, 'utf8');
      const encrypts = JSON.parse(data);
      console.log('GitOperator: 成功读取脚本数据，共', encrypts.length, '条');
      return { success: true, num: encrypts.length, encrypts };
	} catch (error) {
	  console.error('GitOperator: 读取配置失败:', error.message);
      // 如果文件不存在，尝试创建初始数据
      if (error.code === 'ENOENT') {
        console.log('GitOperator: 配置文件不存在，创建初始数据...');
        try {
          await this.createInitialData();
          const data = await fsPromises.readFile(this.dataFile, 'utf8');
          const encrypts = JSON.parse(data);
          console.log('GitOperator: 已成功创建初始设置数据');
          return { success: true, num: encrypts.length, encrypts };
        } catch (createError) {
          console.error('GitOperator: 创建初始数据失败:', createError.message);
          return { success: false, num: 0, error: '无法创建初始数据: ' + createError.message, encrypts: [] };
        }
      }
      return { success: false, num: 0, error: error.message, encrypts: [] };
	}	  
  }
  
  async saveEncrypts(data, isEncypt) {
	try {
	  const { num, encrypts } = await this.getEncrypts();
	  
	  if (isEncypt) {
		// 加密数据
	    const encryptedData = this.dataEncrypts(JSON.stringify(data));
		const newEncrypt = {
			"mark": data.Name + '_' + data.repo + '_' + new Date().getTime(),
			"key": encryptedData
		};
		
		encrypts.push(newEncrypt);
		await fsPromises.writeFile(this.dataFile, JSON.stringify(encrypts, null, 2), 'utf8');
		
		return { success: true, encrypt: newEncrypt };
	  } else {
		// 不加密数据
		encrypts.push(data);
		await fsPromises.writeFile(this.dataFile, JSON.stringify(encrypts, null, 2), 'utf8');
		
		return { success: true, encrypt: data };
	  }
	} catch (error) {
	  console.error('保存脚本失败:', error);
      return { success: false, error: error.message };
	}
  }
  
  // AES-CBC加密
  dataEncrypts(data) {
	const encryptedData = CryptoJS.AES.encrypt(data, this.secretKey, { iv: this.iv }).toString();
    // console.log('Encrypted Data:', encryptedData);
	return encryptedData;
  }
  
  // AES-CBC解密
  dataDecrypts(data) {
	const bytes = CryptoJS.AES.decrypt(data, this.secretKey, { iv: this.iv });
	const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
	// console.log('Decrypted Data:', decryptedData);
	return decryptedData;
  }
	
  // 获取仓库文件树（递归）
  async getRepoTree(data) {
	try {
		// 解密密钥
		const decryptedData = this.dataDecrypts(data);
		const decrypted = JSON.parse(decryptedData);
		
		// 拉取仓库目录
		const response = await axios.get(
		  `${this.GITHUB_API}/repos/${decrypted.Name}/${decrypted.repo}/git/trees/${decrypted.branch}?recursive=1`,
		  {
            headers: {
              Authorization: `token ${decrypted.token}`,
              Accept: 'application/vnd.github.v3+json'
            }
          }
		);
        const tree = response.data.tree;
        const files = tree
            .filter(item => item.type === 'blob')
            .map(file => ({
                path: file.path,
                downloadUrl: `https://github.com/${decrypted.Name}/${decrypted.repo}/raw/${decrypted.branch}/${file.path}`
            }));
        return { success: true, content: JSON.stringify(files) };
    } catch (error) {
        console.error("拉取GitHub仓库目录失败:", error);
        return { success: false, error: error.message };
    }
  }
  
  // 下载仓库文件
  async downLoadFileFromGithub(data, filePath) {
    try {
	  // 解密密钥
	  const decryptedData = this.dataDecrypts(data);
	  const decrypted = JSON.parse(decryptedData);

	  const response = await axios.get(
	    `${this.GITHUB_LOAD}/${decrypted.Name}/${decrypted.repo}/${decrypted.branch}/${filePath}`, 
	    {
		  headers: {
		    Authorization: `Bearer ${decrypted.token}`,
		    'User-Agent': 'NodeJSApp'
		  },
		  responseType: 'stream'
	    }
	  );

	  const outputLocationPath = path.join(os.tmpdir(), filePath.split("/").slice(-1)[0]);
	  const writer = fs.createWriteStream(outputLocationPath);
	
	  response.data.pipe(writer);

	  return new Promise((resolve, reject) => {
		writer.on("finish", async () => {
          // 使用默认程序打开文件
          await shell.openPath(outputLocationPath);
          resolve({ success: true, path: outputLocationPath });
        });
	    writer.on('error', reject);
	  });

    } catch (error) {
	  return { success: false, error: error.message };
    }
  }
  
  // 选择文件夹
  async selectFolder() {
	try {
      const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
	  if (!result.canceled && result.filePaths.length > 0) {
		return { success: true, filePath: result.filePaths[0] };
	  }
	  return { success: false, error: '未选择文件夹' };
	} catch (error) {
	  return { success: false, error: error.message };
	}
  }
  
  // 压缩文件
  async compressFolder(folderPath) {
	try {
	  const zip = new AdmZip();
	  const outputZipPath = path.join(folderPath + '.zip');
	  zip.addLocalFolder(folderPath);
	  zip.writeZip(outputZipPath);
	  return { success: true, filePath: outputZipPath };
	} catch (error) {
	  return { success: false, error: error.message };
	}
  }
  
  async upLoadFileToGithub(data, zipPath) {
    try {
	  // 解密密钥
	  const decryptedData = this.dataDecrypts(data);
	  const decrypted = JSON.parse(decryptedData);
		
      const fileName = path.basename(zipPath);
      const content = fs.readFileSync(zipPath).toString('base64');

      const url = `${this.GITHUB_API}/repos/${decrypted.Name}/${decrypted.repo}/contents/uploads/${fileName}`;
      const response = await axios.put(url, {
        message: 'upload folder via electron',
        content: content,
        branch: `${decrypted.branch}`
      }, 
	  {
        headers: {
          Authorization: `token ${decrypted.token}`,
          'User-Agent': 'NodeJSApp'
        }
      });

      return { success: true, msg: '上传成功'};
    } catch (err) {
      return { success: false, msg: '上传失败', error: error.message };
    }
  }
  
}
module.exports = GitOperator;
