/**
 * gitHub仓库管理
 * 提供简单的上传、下载功能
 */
 
class GitManager {
  constructor() {
	this.nums = 0;
	this.keys = [];
    this.init();
  }

  init() {
	this.loadEncrypts();
    this.bindEvents();
  }
  
  /**
   * 加载配置
   */
  async loadEncrypts() {
    try {
      const result = await window.electronAPI.getEncrypts();
      if (result.success) {
		this.keys = result.encrypts;
		this.nums = result.num;
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 脚本仓库按钮点击
    document.getElementById('github-btn')?.addEventListener('click', () => {
      this.showGitManager();
    });
  }
  
  /**
   * 显示任务管理界面
   */
  showGitManager() {
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.textContent = '仓库脚本管理';
    modalBody.innerHTML = this.renderGitManagerHTML();

    // 显示模态框
    document.getElementById('modal-overlay').style.display = 'flex';
	
    // 绑定切换页签事件
    this.bindSwitchTabEvents();

    // 刷新页签页面内容
    this.refreshTabPage();
	
	// 绑定表单相关事件
	this.bindCreateGitFormEvents();
  }

  /**
   * 渲染仓库脚本管理界面HTML
   */
  renderGitManagerHTML() {
    return `
	  <div class="tab-container">
	    <div class="tab-header">
		  <button class="tab-btn active" data-tab="tab1">
		    <span class="tab-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            </span>
            仓库配置
		  </button>
		  <button class="tab-btn" data-tab="tab2">
		    <span class="tab-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8M12 19.8V12M16 17l-4 4-4-4"/></svg>
            </span>
            下载脚本
		  </button>
		  <button class="tab-btn" data-tab="tab3">
		    <span class="tab-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21"/><path d="M16 16l-4-4-4 4"/></svg>
            </span>
            上传脚本
		  </button>
		</div>

		<div id="tab1" class="tab-content active">
		</div>

		<div id="tab2" class="tab-content">
		</div>

		<div id="tab3" class="tab-content">
		</div>
	  </div>

      <style>
		* {
			  box-sizing: border-box;
			}

			.tab-container {
			  max-width: 800px;
			  margin: 0 auto;
			  background: var(--modal-bg);
			  border-radius: 12px;
			  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
			  overflow: hidden;
			}

			.tab-header {
			  display: flex;
			  border-bottom: 1px solid #e0e0e0;
			}

			.tab-header button {
			  flex: 1;
			  padding: 16px 20px;
			  background: none;
			  border: none;
			  font-size: 16px;
			  font-weight: 600;
			  color: var(--text-color);
			  cursor: pointer;
			  position: relative;
			  transition: all 0.3s ease;
			}

			.tab-header button.active {
			  color: var(--primary-color);
			}

			.tab-header button.active::after {
			  content: '';
			  position: absolute;
			  bottom: 0;
			  left: 0;
			  width: 100%;
			  height: 3px;
			  background-color: var(--primary-color);
			}

			.tab-content {
			  padding: 24px;
			  min-height: 150px;
			  display: none;
			}

			.tab-content.active {
			  display: block;
			  animation: fadeIn 0.3s ease-in-out;
			}

			@keyframes fadeIn {
			  from { opacity: 0; transform: translateY(10px); }
			  to { opacity: 1; transform: translateY(0); }
			}
			
			.form-group {
			  margin-bottom: 16px;
			}
			
			label {
			  display: block;
			  margin-bottom: 6px;
			  font-weight: 500;
			  color: var(--text-color);
			}
			
			textarea {
			  height: 100px;
			}
			
			input[type="text"], textarea, select {
			  width: 100%;
			  padding: 10px 14px;
			  border: 1px solid #ccc;
			  border-radius: 8px;
			  font-size: 14px;
			  color: var(--text-color);
			  resize: vertical;
			  background: var(--input-bg);
			}
		
		    .submit-btn {
			  background-color: var(--primary-color);
			  color: #fff;
			  border: none;
			  padding: 10px 16px;
			  border-radius: 8px;
			  cursor: pointer;
			  transition: background 0.3s ease;
			}

			.submit-btn:hover {
			  background-color: var(--primary-hover);
			}
			
			.share-link {
			  display: flex;
			  align-items: stretch;
			  gap: 10px;
			  margin-top: 10px;
			  justify-content: space-between;
			}

			.share-url {
			  flex: 1;
			  padding: 10px 12px;
			  font-size: 14px;
			  background-color: #f1f1f1;
			  border: 1px solid #ddd;
			  border-radius: 6px;
			  cursor: pointer;
			}

			.copy-btn {
			  background-color: var(--primary-color);
			  color: white;
			  border: none;
			  padding: 10px 16px;
			  border-radius: 6px;
			  cursor: pointer;
			  transition: background-color 0.3s ease;
			}

			.copy-btn:hover {
			  background-color: var(--primary-hover);
			}
			
			.submit-link {
			  display: flex;
			  align-items: stretch;
			  gap: 10px;
			  margin-top: 10px;
			  justify-content: space-between;
			}
			
			.hidden { display  : none; }
			
			.loading-btn {
			  width: 100%;
			  background-color: var(--primary-color);
			  color: white;
			  padding: 10px 20px;
			  border: none;
			  border-radius: 5px;
			  cursor: pointer;
			  font-size: 16px;
			  transition: background 0.3s;
			}
			
			.loading-btn:hover {
			  background-color: var(--primary-hover);
			}
			
			.loader {
			  border: 5px solid #f3f3f3;
			  border-top: 5px solid #1abc9c;
			  border-radius: 50%;
			  width: 40px;
			  height: 40px;
			  animation: spin 1s linear infinite;
			  margin: 20px auto;
			}
			
			/* 卡片样式 */
			.card-container {
			  display: grid;
			  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
			  gap: 20px;
			  justify-items: end;
			  margin-top: 10px;
			}

			.card {
			  background: white;
			  border-radius: 10px;
			  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
			  padding: 2px;
			  transition: transform 0.3s;
			}

			.card:hover {
			  transform: translateY(-5px);
			}

			.card h3 {
			  margin-top: 0;
			  font-size: 1.2em;
			}

			.card p {
			  color: #666;
			}

			@media (max-width: 600px) {
			  .tabs {
				flex-direction: column;
			  }
			}
			
			.overlay {
			  position: absolute;
			  top: 0;
			  left: 0;
			  width: 100%;
			  height: 100%;
			  background-color: rgba(0, 0, 0, 0.3);
			  border-radius: 8px;
			  display: none;
			  justify-content: center;
			  align-items: center;
			  z-index: 2;
			}

			.dloader {
			  width: 40px;
			  height: 40px;
			  border: 4px solid #fff;
			  border-top: 4px solid transparent;
			  border-radius: 50%;
			  animation: spin 1s linear infinite;
			}

			@keyframes spin {
			  to {
				transform: rotate(360deg);
			  }
			}
			
			/* Tab3 文件上传 */
			.upload-container {
			  max-width: 500px;
			  margin: 0 auto;
			  padding: 20px;
			  border: 2px dashed #ccc;
			  border-radius: 10px;
			  text-align: center;
			  background: var(--input-bg);
			  cursor: pointer;
			  transition: background 0.3s;
			}

			.upload-container:hover {
			  background: #f0f8ff;
			}

			.upload-container button {
			  display: none;
			}

			.upload-label {
			  font-size: 16px;
			  color: #4a90e2;
			}

			.loading-spinner-git {
			  display: none;
			  margin-top: 20px;
			}

			.loading-text {
			  margin-top: 10px;
			  font-size: 14px;
			  color: #333;
			}

			@keyframes spin {
			  0% { transform: rotate(0deg); }
			  100% { transform: rotate(360deg); }
			}
      </style>
    `;
  }  
  
  /**
   * 切换tab页签
   */
  bindSwitchTabEvents() {
    const buttons = document.getElementsByClassName('tab-btn');
	
	for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', (e) => {
        this.switchGitTabPage(e);
      });
    }
  }
   
  switchGitTabPage(evt) {
	const tabs = document.getElementsByClassName('tab-content');
	const buttons = document.getElementsByClassName('tab-btn');
	const activeTab = document.getElementById(evt.currentTarget.dataset.tab);
	
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
    }

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
    }

    activeTab.classList.add('active');
    evt.currentTarget.classList.add('active');
  }
  
  async refreshTabPage() {
	const tabPage = document.getElementById('tab1');
	const tab2Page = document.getElementById('tab2');
	const tab3Page = document.getElementById('tab3');
	
	if (!tabPage) return;
	
	if (this.nums <= 0) {
	  tabPage.innerHTML = this.renderGitRepoKeyForm();
	  
	  tab2Page.innerHTML = `<label for="message">请先上传GitHub密钥配置</label>`;
	  
	  tab3Page.innerHTML = `<label for="message">请先上传GitHub密钥配置</label>`;
	} else {
	  // 从本地获取数据
	  tabPage.innerHTML = this.renderGitCopyLinkForm();
	  
	  tab2Page.innerHTML = this.renderGitRepoTreeByLocal();
	  
	  tab3Page.innerHTML = this.renderGitRepoUpLoad();
	}
  }
  
  /**
   * 绑定创建仓库表单事件
   */
  bindCreateGitFormEvents() {
	try {
	  const form = document.getElementById('create-git-form');
	  // 表单提交
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateGitSubmit();
      });
	  
	  const tabCreatePage = document.getElementById('tab-create-page');
	  const tabCopyPage = document.getElementById('tab-copy-page');
	  const gitKeySelect = document.getElementById('select-git-key');
	  const shareLink = document.getElementById('share-link');
	  // 选择下拉框
	  gitKeySelect?.addEventListener('change', (e) => {
		shareLink.value = e.target.value;
		// 缓存密钥
		localStorage.setItem('gitKey',  e.target.value);
	  });
	  
	  const copyShareBtn = document.getElementById('copy-share-btn');
	  // 点击复制链接
	  copyShareBtn?.addEventListener('click', (e) => {
		shareLink.select();
        shareLink.setSelectionRange(0, 99999);
        document.execCommand("copy");
		this.showNotification('链接已复制到剪贴板', 'success');
	  });
	  
	  const backCreatePage = document.getElementById('back-create-btn');
	  // 点击返回上传页面
	  backCreatePage?.addEventListener('click', (e) => {
		tabCopyPage.style.display = "none";
		tabCreatePage.style.display = "block";
	  });
	  
	  const backCopyPage = document.getElementById('back-copy-btn');
	  // 点击返回复制页面
	  backCopyPage?.addEventListener('click', (e) => {
		tabCreatePage.style.display = "none";
		tabCopyPage.style.display = "block";
	  });

	  const loadGitBtn = document.getElementById('load-git-btn');
	  // 点击加载仓库脚本
	  loadGitBtn?.addEventListener('click', async (e) => {
		const gitKey = localStorage.getItem('gitKey');
        const loading = document.getElementById('loading');
        const dataContainer = document.getElementById('dataContainer');

        // 显示加载动画
        loading.style.display = 'block';
        dataContainer.style.display = 'none';
		
		// 加载仓库
		const result = await window.electronAPI.getRepoTree(gitKey);
		loading.style.display = 'none';
		if (result.success) {
		  dataContainer.innerHTML = this.renderGitRepoTree(JSON.parse(result.content));
		  // 缓存目录树
		  localStorage.setItem('gitTree', result.content);
		} else {
		  this.showNotification('加载仓库脚本失败: ' + result.error, 'error');
		}
		dataContainer.style.display = 'block';
	  });
	  
	  document.querySelectorAll('#download-git-bth').forEach(btn => {
		btn.addEventListener('click', async (e) => {
		  const overlay = document.getElementById('overlay');
          overlay.style.display = 'flex';
		  
		  // 下载仓库脚本
		  const gitKey = localStorage.getItem('gitKey');
		  const result = await window.electronAPI.downLoadFileFromGithub(gitKey, e.target.innerText);
		  overlay.style.display = 'none';
		  if (result.success) {
			  this.showNotification('脚本保存路径：' + result.path, 'success');
		  } else {
			  this.showNotification('脚本下载失败: ' + result.error, 'error');
		  }
	    });
	  });
	  
	  const selectBtn = document.getElementById('select-folder');
	  // 点击上传仓库脚本
	  selectBtn?.addEventListener('click', async (e) => {
	    const loadingSpinner = document.getElementById('loadingSpinner');
		loadingSpinner.style.display = 'block';
		
		const selectFolderResult = await window.electronAPI.selectFolder();
		if (selectFolderResult.success) {
		  const compressFolderResult = await window.electronAPI.compressFolder(selectFolderResult.filePath);
		  if (compressFolderResult.success) {
			  const gitKey = localStorage.getItem('gitKey');
			  const upLoadResult = await window.electronAPI.upLoadFileToGithub(gitKey, compressFolderResult.filePath);
			  if (upLoadResult.success) {
				this.showNotification('上传压缩文件成功', 'success');
			  } else {
				this.showNotification('上传压缩文件失败: ' + upLoadResult.error, 'error');
			  }
			  loadingSpinner.style.display = 'none';
		  } else {
			loadingSpinner.style.display = 'none';
			this.showNotification('压缩文件目录失败: ' + compressFolderResult.error, 'error');
		    return;  
		  }
		} else {
		  loadingSpinner.style.display = 'none';
		  this.showNotification('选择文件目录失败: ' + selectFolderResult.error, 'error');
		  return;
		}
	  });
	  
	} catch (error) {
		loadingSpinner.style.display = 'none';
		this.showNotification('表单监听事件异常: ' + error.message, 'error');
	}
  }
  
  /**
   * 渲染密钥表单
   */
  renderGitRepoKeyForm() {
	  return `
	    <form id="create-git-form">
		  <div class="form-group">
		    <label for="message">密钥信息</label>
		    <textarea id="message" placeholder='输入以下内容生成可分享密钥串：\n{"token":"GitHub Token", "Name":"GitHub UserName", "repo":"GitHub Repository Name", "branch":"GitHub branch"}\n或者直接输入密钥串使用：\n{"mark": "张三的密钥", "key": "xxx..."}'></textarea>
		  </div>
		  <button type="submit" class="submit-btn">上传密钥</button>
	    </form>
	  `;
  }
  
  /**
   * 渲染密钥链接页面
   */
  renderGitCopyLinkForm() {
	  let gitKey = localStorage.getItem('gitKey');
	  if (gitKey == null || gitKey == "") gitKey = "";
	  
	  return `
	  <div id="tab-copy-page">
	    <select id="select-git-key" required>
		  <option value="">请选择一个选项</option>
		  ${this.keys.map(encrypt =>
              `<option value="${encrypt.key}" ${encrypt.key === gitKey ? 'selected' : ''}>${encrypt.mark}</option>`
            ).join('')}
		</select>
        <div class="share-link">
		  <button class="copy-btn" id="back-create-btn">
		    <span class="tab-icon">
			  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
            </span>
		  </button>
          <input type="text" class="share-url" id="share-link" placeholder="请选择密钥" value="${gitKey}" readonly>
          <button type="button" class="copy-btn" id="copy-share-btn">复制链接</button>
        </div>
	  </div>
	  <div id="tab-create-page" class="hidden">
		  <form id="create-git-form">
		    <div class="form-group">
		      <label for="message">密钥信息</label>
		      <textarea id="message" placeholder='输入以下内容生成可分享密钥串：\n{"token":"GitHub Token", "Name":"GitHub UserName", "repo":"GitHub Repository Name", "branch":"GitHub branch"}\n或者直接输入密钥串使用：\n{"mark": "张三的密钥", "key": "xxx..."}'></textarea>
		    </div>
			<div class="submit-link">
			  <button type="submit" class="submit-btn">上传密钥</button>
              <button type="button" class="submit-btn" id="back-copy-btn">
		        <span class="tab-icon">
			      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
                </span>
		      </button>
			</div>
	      </form>	  
	  </div>
	`;
  }
  
  /**
   * 渲染仓库列表
   */
  renderGitRepoTree(trees) {
	  return `
	    <div class="card-container">
		${trees.map(tree =>
              `<button url="${tree.downloadUrl}" class="card" id="download-git-bth">${tree.path}</button>`
            ).join('')}
		  <div class="overlay" id="overlay">
            <div class="dloader"></div>
          </div>
		</div> 
	  `;
  }

  /**
   * 使用缓存渲染仓库列表
   */
  renderGitRepoTreeByLocal() {
	 let gitTree = localStorage.getItem('gitTree');
	 if (gitTree == null || gitTree == "") {
		 gitTree = Array();
	 } else {
		 gitTree = JSON.parse(gitTree);
	 };
	 
	 return `
	   <button class="loading-btn" id="load-git-btn">加载仓库脚本</button>
	   <div id="loading" class="loader" style="display: none;"></div>
	   <div id="dataContainer" class="data" style="display: block;">
	   <div class="card-container">
	   ${gitTree.map(tree =>
            `<button url="${tree.downloadUrl}" class="card" id="download-git-bth">${tree.path}</button>`
          ).join('')}
	     </div>
	     <div class="overlay" id="overlay">
           <div class="dloader"></div>
         </div>
	   </div>
	  `;
  }
  
  /**
   * 渲染上传文件
   */
  renderGitRepoUpLoad() {
	return `
	<div class="upload-content">
	  <h2>上传脚本</h2>
      <label class="upload-container">
        <button id="select-folder"></button>
        <span class="upload-label">点击选择文件夹</span>
      </label>
	</div>
	<div class="loading-spinner-git" id="loadingSpinner">
      <div class="loading-text">上传中，请稍候...</div>
    </div>
	`
  }
  
  
  /**
   * 处理创建仓库表单提交
   */
  async handleCreateGitSubmit() {
	try {
	  const message = document.getElementById('message').value;
	  const messageObj = JSON.parse(message);
	  const keyContents = Object.keys(messageObj).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join("");
		
	  // 上传token生成密钥
	  if (keyContents.toLowerCase() == "branchnamerepotoken") {
		const result = await window.electronAPI.saveEncrypts(messageObj, true);
		if (result.success) {
			this.showNotification('保存密钥成功', 'success');
			await this.loadEncrypts();
			this.showGitManager();
		} else {
			this.showNotification('保存密钥失败: ' + result.error, 'error');
			return;
		}
	  // 使用分享的密钥
	  } else if (keyContents.toLowerCase() == "keymark") {
		const result = await window.electronAPI.saveEncrypts(messageObj, false);
		if (result.success) {
			this.showNotification('保存密钥成功', 'success');
			await this.loadEncrypts();
			this.showGitManager();
		} else {
			this.showNotification('保存密钥失败: ' + result.error, 'error');
			return;
		}
	  } else {
		this.showNotification('保存密钥失败: 上传内容不合规', 'error');
		return;
	  }
	} catch (error) {
	  this.showNotification('保存密钥失败: 上传内容不合规', 'error');
	}
  }
  
  /**
   * 显示通知
   */
  showNotification(message, type = 'info') {
    // 使用现有的通知系统
    if (window.scriptManager && window.scriptManager.showNotification) {
      window.scriptManager.showNotification(message, type);
    } else {
      // 创建简单的通知
      this.createSimpleNotification(message, type);
    }
  }

  /**
   * 创建简单通知
   */
  createSimpleNotification(message, type) {
    // 创建通知容器（如果不存在）
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // 添加到容器
    container.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// 导出给全局使用
window.GitManager = GitManager;