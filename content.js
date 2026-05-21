chrome.storage.local.get(['isTabulaBiliEnabled'], (result) => {
  if (result.isTabulaBiliEnabled) {
    
    const tryClickRollBtn = () => {
      const rollBtn = document.querySelector('.roll-btn');
      if (rollBtn) {
        rollBtn.click(); // 触发刷新
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // 监视 body 内的所有元素变动
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
      }, 10000);
    }
  }
});