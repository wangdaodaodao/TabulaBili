document.addEventListener('DOMContentLoaded', async () => {
  const modeSwitch = document.getElementById('modeSwitch');
  const statusDesc = document.getElementById('statusDesc');
  const footerText = document.getElementById('footerText');
  const modeBadge = document.getElementById('modeBadge');
  const indicator = document.getElementById('indicator');
  const RULESET_ID = 'rules';

  // 更新UI文字与指示灯状态
  const updateUI = (isEnabled) => {
    modeSwitch.checked = isEnabled;
    if (isEnabled) {
      modeBadge.textContent = 'ACTIVE';
      modeBadge.style.color = '#10b981';
      modeBadge.style.background = 'rgba(16, 185, 129, 0.1)';
      modeBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
      indicator.classList.add('active');
      statusDesc.textContent = '已开启：自动剥离首页推荐 Cookie，享受纯净热门流，视频播放保持 1080P 高清体验。';
      
      footerText.textContent = '规则运行中，时刻守护首页纯净'; 
      footerText.style.color = 'var(--status-active)'; // 让文字也变绿
    } else {
      modeBadge.textContent = 'OFF';
      modeBadge.style.color = 'var(--text-sub)';
      modeBadge.style.background = 'rgba(100, 116, 140, 0.1)';
      modeBadge.style.borderColor = 'rgba(100, 116, 140, 0.2)';
      indicator.classList.remove('active');
      statusDesc.textContent = '已关闭：已恢复原版B站个性化推荐，将根据你的历史播放习惯展示内容。';
      footerText.textContent = '功能已关闭，个性化推荐已恢复';
      footerText.style.color = 'var(--text-muted)'; // 变回灰色
    }
  };

  // 1. 获取当前规则集状态
  try {
    const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    const isEnabled = enabledRulesets.includes(RULESET_ID);
    chrome.storage.local.set({ isTabulaBiliEnabled: isEnabled });
    
    updateUI(isEnabled);
  } catch (err) {
    statusDesc.textContent = '状态获取失败，请确保在 Chrome 扩展环境中运行。';
    console.error(err);
  }

  // 2. 监听开关切换事件
  modeSwitch.addEventListener('change', async (e) => {
    const nextState = e.target.checked;
    modeSwitch.disabled = true;

    try {
      if (nextState) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: [RULESET_ID] });
      } else {
        await chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: [RULESET_ID] });
      }
      chrome.storage.local.set({ isTabulaBiliEnabled: nextState });
      
      updateUI(nextState);

      // 3. 检测当前是否在 B 站页面，自动刷新
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const tabUrl = new URL(tabs[0].url);
          if (tabUrl.hostname === 'bilibili.com' || tabUrl.hostname.endsWith('.bilibili.com')) {
            footerText.textContent = 'B站首页内容刷新中...';
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                const rollBtn = document.querySelector('.roll-btn');
                if (rollBtn) {
                  rollBtn.click();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  location.reload();
                }
              }
            });
          } else {
            footerText.textContent = '切换成功，打开或刷新 B 站首页生效';
          }
        } catch (urlError) {
          footerText.textContent = '切换成功，打开或刷新 B 站首页生效';
        }
      } else {
        footerText.textContent = '切换成功，打开或刷新 B 站首页生效';
      }
    } catch (err) {
      statusDesc.textContent = '切换规则失败：' + err.message;
      console.error(err);
      modeSwitch.checked = !nextState;
    } finally {
      modeSwitch.disabled = false;
    }
  });
});