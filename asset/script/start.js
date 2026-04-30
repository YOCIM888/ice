// asset/script/start.js
(function() {
    "use strict";

    // ---------- 存储键 (与登录页保持一致) ----------
    const STORAGE_ACCOUNTS = 'frozen_kingdom_accounts';
    const STORAGE_CURRENT_USER = 'frozen_current_user';

    // DOM 元素
    const classButtons = document.querySelectorAll('.class-btn');
    const portraitImg = document.getElementById('classPortrait');
    const statsListEl = document.getElementById('statsList');
    const storyTextEl = document.getElementById('classStory');
    const journeyBtn = document.getElementById('startJourneyBtn');
    const messageEl = document.getElementById('journeyMessage');

    // 当前选中的职业 (默认狂战)
    let selectedClass = '狂战';

    // ---------- 职业数据 (六维 + 故事) ----------
    const classData = {
        '狂战': {
            stats: { 力量: 10, 体质: 9, 敏捷: 5, 感知: 4, 智力: 3, 幸运: 5 },
            story: '来自北境蛮族，在狂怒中挥舞巨斧。他坚信力量能劈开一切冰墙，每一次怒吼都令敌人胆寒。'
        },
        '游侠': {
            stats: { 力量: 5, 体质: 6, 敏捷: 10, 感知: 8, 智力: 5, 幸运: 7 },
            story: '森林的独行者，百步穿杨。她与冰原狼为伴，箭矢能穿透凛冽寒风，从不失手。'
        },
        '牧师': {
            stats: { 力量: 4, 体质: 5, 敏捷: 4, 感知: 9, 智力: 8, 幸运: 8 },
            story: '圣光教会的虔信者，能治愈创伤、驱散严寒。她手持圣典，为王国带来温暖与希望。'
        },
        '法师': {
            stats: { 力量: 3, 体质: 4, 敏捷: 5, 感知: 7, 智力: 10, 幸运: 6 },
            story: '研习古老冰霜魔法的智者，能召唤暴风雪。但脆弱的身体需要智慧的保护。'
        },
        '盾骑': {
            stats: { 力量: 8, 体质: 10, 敏捷: 3, 感知: 5, 智力: 4, 幸运: 5 },
            story: '王国的钢铁壁垒，手持巨盾守护队友。任何冲击都无法让他后退半步。'
        },
        '武僧': {
            stats: { 力量: 7, 体质: 8, 敏捷: 9, 感知: 8, 智力: 6, 幸运: 5 },
            story: '雪山隐修者，以拳脚功夫闻名。他追求身心合一，每一击都蕴含寒冰真气。'
        },
        '平民': {
            stats: { 力量: 4, 体质: 5, 敏捷: 5, 感知: 6, 智力: 6, 幸运: 10 },
            story: '普通的冰封王国子民，没有显赫出身，但幸运与坚韧往往创造奇迹。'
        }
    };

    // 职业名称与图片文件名的映射 (立绘路径: ../image/role/职业名.png)
    // 默认与职业名一致

    // ---------- 渲染六维图 ----------
    function renderStats(className) {
        const data = classData[className];
        if (!data) return;
        const stats = data.stats;
        const statOrder = ['力量', '体质', '敏捷', '感知', '智力', '幸运'];
        
        let html = '';
        for (let stat of statOrder) {
            const value = stats[stat];
            // 最大值为10，计算百分比
            const percent = (value / 10) * 100;
            html += `
                <div class="stat-item">
                    <span class="stat-label">${stat}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar-fill" style="width: ${percent}%;"></div>
                    </div>
                    <span class="stat-value">${value}</span>
                </div>
            `;
        }
        statsListEl.innerHTML = html;
    }

    // 更新立绘与故事
    function updateClassDisplay(className) {
        // 立绘
        portraitImg.src = `../image/role/${className}.png`;
        portraitImg.alt = `${className}立绘`;
        
        // 故事
        const data = classData[className];
        storyTextEl.textContent = data ? data.story : '风雪中的旅人……';
        
        // 六维
        renderStats(className);
        
        // 按钮激活样式
        classButtons.forEach(btn => {
            const btnClass = btn.getAttribute('data-class');
            if (btnClass === className) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        selectedClass = className;
    }

    // ---------- 事件：点击职业按钮 ----------
    classButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const className = btn.getAttribute('data-class');
            updateClassDisplay(className);
        });
    });

    // 默认选中狂战
    updateClassDisplay('狂战');

    // ---------- 账户与数据存储 ----------
    function getCurrentUser() {
        return localStorage.getItem(STORAGE_CURRENT_USER);
    }

    function loadAccounts() {
        const stored = localStorage.getItem(STORAGE_ACCOUNTS);
        if (stored) {
            try {
                return JSON.parse(stored) || {};
            } catch(e) {
                return {};
            }
        }
        return {};
    }

    function saveAccounts(accounts) {
        localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
    }

    // 踏上旅程
    function handleStartJourney() {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            messageEl.textContent = '⚠️ 未检测到登录状态，请返回登录界面';
            return;
        }

        if (!selectedClass) {
            messageEl.textContent = '❄️ 请先选择一个职业';
            return;
        }

        // 读取账户数据
        let accounts = loadAccounts();
        
        if (!accounts[currentUser]) {
            // 理论上不应该发生，但以防万一
            messageEl.textContent = '账户数据异常，请重新登录';
            return;
        }

        // 保存职业选择到当前账户
        accounts[currentUser].characterClass = selectedClass;
        accounts[currentUser].classStats = classData[selectedClass].stats;
        accounts[currentUser].lastUpdated = Date.now();
        
        saveAccounts(accounts);
        
        messageEl.textContent = `✨ 命运已定，${currentUser} 踏上 ${selectedClass} 之路 ✨`;
        
        // 跳转至 village.html
        setTimeout(() => {
            window.location.href = 'village.html';
        }, 400);
    }

    journeyBtn.addEventListener('click', handleStartJourney);

    // 可选：如果未登录，显示提示
    const user = getCurrentUser();
    if (!user) {
        messageEl.textContent = '❄️ 尚未登录，选择职业后仍可继续（但数据无法保存）';
    } else {
        messageEl.textContent = `👑 ${user} · 选择你的命运`;
    }

})();
