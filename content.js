chrome.storage.local.get(['isTabulaBiliEnabled'], (result) => {
  if (result.isTabulaBiliEnabled) {
    
    const tryClickRollBtn = () => {
      const rollBtn = document.querySelector('.roll-btn');
      if (rollBtn) {
        // 若用户已开始浏览则禁用自动刷新
        if (window.scrollY < 100) {
          rollBtn.click(); 
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.log('[TabulaBili-Plus] 按钮加载过慢，用户已开始浏览，放弃自动刷新以保护体验。');
        }
        return true; 
      }
      return false; 
    };

    if (!tryClickRollBtn()) {
      const observer = new MutationObserver((mutations, obs) => {
        if (tryClickRollBtn()) {
          obs.disconnect(); 
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
      }, 8000);
    }
  }
});