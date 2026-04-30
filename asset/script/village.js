// asset/script/village.js
(function(){
    "use strict";

    const STORAGE_ACCOUNTS = 'frozen_kingdom_accounts';
    const STORAGE_CURRENT_USER = 'frozen_current_user';

    let avatarImg, avatarBox, charClassSpan, charLevelSpan, expBarFill, expText, goldSpan, diamondSpan, evoCoinSpan, msgDiv;
    let backpackModal, backpackGrid, attributesPanel, tabBtns, backpackCloseBtn, backpackBackdrop;
    let dungeonModal, battleModal, battleCloseBtn, battleFloor, battleMonsterName;
    let playerBattleAvatar, playerBattleClass, playerBattleLevel, playerHpBar, playerCurrentHp, playerMaxHp, playerMagicBar, playerCurrentMagic, playerMaxMagic;
    let monsterBattleAvatar, monsterName, monsterHpBar, monsterCurrentHp, monsterMaxHp, monsterAtk, monsterDef;
    let battleLog, actionBtns;
    let petModal;
    let petReleaseMode = false;

    let skillSelectModal, skillSelectList;
    let currentUser = null;
    let accounts = {};
    let selectedRunes = [];

    // 经验曲线配置
    const EXP_CURVE_CONFIG = {
        phaseMultipliers: {
            '1-40': 1.18,
            '41-80': 1.14,
            '81-120': 1.10
        },
        phaseThresholds: [1, 41, 81, 121],
        baseExp: 100
    };

    // 职业基础属性配置
    const CLASS_BASE_STATS = {
        '狂战': { strength: 10, constitution: 9, agility: 5, perception: 4, intelligence: 3, luck: 5, magic: 30 },
        '游侠': { strength: 5, constitution: 6, agility: 10, perception: 8, intelligence: 5, luck: 7, magic: 35 },
        '牧师': { strength: 4, constitution: 5, agility: 4, perception: 9, intelligence: 8, luck: 8, magic: 50 },
        '法师': { strength: 3, constitution: 4, agility: 5, perception: 7, intelligence: 10, luck: 6, magic: 60 },
        '盾骑': { strength: 8, constitution: 10, agility: 3, perception: 5, intelligence: 4, luck: 5, magic: 25 },
        '武僧': { strength: 7, constitution: 8, agility: 9, perception: 8, intelligence: 6, luck: 5, magic: 40 },
        '平民': { strength: 5, constitution: 5, agility: 5, perception: 6, intelligence: 6, luck: 10, magic: 35 }
    };

    // 职业系数
    const CLASS_COEFFICIENTS = {
        '狂战': { hpCoefficient: 2.7, attackCoefficient: { stat: 'strength', value: 1.6 }, defenseCoefficient: 1.0 },
        '游侠': { hpCoefficient: 2.2, attackCoefficient: { stat: 'agility', value: 1.4 }, defenseCoefficient: 0.7 },
        '牧师': { hpCoefficient: 2.0, attackCoefficient: { stat: 'perception', value: 1.3 }, defenseCoefficient: 0.6 },
        '法师': { hpCoefficient: 1.7, attackCoefficient: { stat: 'intelligence', value: 1.5 }, defenseCoefficient: 0.5 },
        '盾骑': { hpCoefficient: 3.1, attackCoefficient: { stat: 'strength', value: 1.0 }, defenseCoefficient: 1.3 },
        '武僧': { hpCoefficient: 2.4, attackCoefficient: { stat: 'agility', value: 1.4 }, defenseCoefficient: 0.9 },
        '平民': { hpCoefficient: 2.0, attackCoefficient: { stat: 'average', value: 1.0 }, defenseCoefficient: 0.6 }
    };

    // 核心属性: 0.7/级, 次要属性: 0.4/级, 边缘属性: 0.2/级

    // 狂战成长配置 - 魔力作为边缘属性，成长约为力量的0.2倍
    const WARRIOR_GROWTH = {
        coreStats: ['strength', 'constitution'],
        majorStats: ['agility'],
        minorStats: ['perception', 'intelligence', 'luck', 'magic'],
        phase1: { core: 0.84, major: 0.24, minor: { perception: 0.16, intelligence: 0.12, luck: 0.24, magic: 0.16 } },
        phase2: { core: 0.7, major: 0.2, minor: { perception: 0.13, intelligence: 0.1, luck: 0.2, magic: 0.14 } },
        phase3: { core: 0.56, major: 0.16, minor: { perception: 0.1, intelligence: 0.08, luck: 0.16, magic: 0.11 } },
        phase4: { core: 0.42, major: 0.12, minor: { perception: 0.08, intelligence: 0.06, luck: 0.12, magic: 0.08 } }
    };

    // 游侠成长配置 - 魔力作为边缘属性，成长约为敏捷的0.15倍
    const RANGER_GROWTH = {
        coreStats: ['agility', 'perception'],
        majorStats: ['luck'],
        minorStats: ['strength', 'constitution', 'intelligence', 'magic'],
        phase1: { core: 0.84, major: 0.24, minor: { strength: 0.16, constitution: 0.12, intelligence: 0.12, magic: 0.12 } },
        phase2: { core: 0.7, major: 0.2, minor: { strength: 0.13, constitution: 0.1, intelligence: 0.1, magic: 0.1 } },
        phase3: { core: 0.56, major: 0.16, minor: { strength: 0.1, constitution: 0.08, intelligence: 0.08, magic: 0.08 } },
        phase4: { core: 0.42, major: 0.12, minor: { strength: 0.08, constitution: 0.06, intelligence: 0.06, magic: 0.06 } }
    };

    // 牧师成长配置 - 魔力作为次要属性，成长约为智力的0.7倍
    const PRIEST_GROWTH = {
        coreStats: ['perception', 'intelligence', 'magic'],
        majorStats: ['luck'],
        minorStats: ['strength', 'constitution', 'agility'],
        phase1: { core: 0.84, major: 0.24, minor: { strength: 0.16, constitution: 0.12, agility: 0.12 } },
        phase2: { core: 0.7, major: 0.2, minor: { strength: 0.13, constitution: 0.1, agility: 0.1 } },
        phase3: { core: 0.56, major: 0.16, minor: { strength: 0.1, constitution: 0.08, agility: 0.08 } },
        phase4: { core: 0.42, major: 0.12, minor: { strength: 0.08, constitution: 0.06, agility: 0.06 } }
    };

    // 法师成长配置 - 魔力作为次要属性，成长约为智力的0.6倍
    const MAGE_GROWTH = {
        coreStats: ['intelligence', 'perception', 'magic'],
        majorStats: ['luck'],
        minorStats: ['strength', 'constitution', 'agility'],
        phase1: { core: 0.84, major: 0.24, minor: { strength: 0.16, constitution: 0.12, agility: 0.12 } },
        phase2: { core: 0.7, major: 0.2, minor: { strength: 0.13, constitution: 0.1, agility: 0.1 } },
        phase3: { core: 0.56, major: 0.16, minor: { strength: 0.1, constitution: 0.08, agility: 0.08 } },
        phase4: { core: 0.42, major: 0.12, minor: { strength: 0.08, constitution: 0.06, agility: 0.06 } }
    };

    // 盾骑成长配置 - 魔力作为边缘属性，成长约为体质的0.15倍
    const GUARDIAN_GROWTH = {
        coreStats: ['constitution', 'strength'],
        majorStats: ['agility'],
        minorStats: ['perception', 'intelligence', 'luck', 'magic'],
        phase1: { core: 0.84, major: 0.24, minor: { perception: 0.16, intelligence: 0.12, luck: 0.24, magic: 0.12 } },
        phase2: { core: 0.7, major: 0.2, minor: { perception: 0.13, intelligence: 0.1, luck: 0.2, magic: 0.1 } },
        phase3: { core: 0.56, major: 0.16, minor: { perception: 0.1, intelligence: 0.08, luck: 0.16, magic: 0.08 } },
        phase4: { core: 0.42, major: 0.12, minor: { perception: 0.08, intelligence: 0.06, luck: 0.12, magic: 0.06 } }
    };

    // 武僧成长配置 - 魔力作为次要属性，成长约为敏捷的0.3倍
    const MONK_GROWTH = {
        coreStats: ['agility', 'perception'],
        majorStats: ['strength', 'constitution', 'magic'],
        minorStats: ['intelligence', 'luck'],
        phase1: { core: 0.84, major: { strength: 0.48, constitution: 0.48, magic: 0.24 }, minor: { intelligence: 0.16, luck: 0.16 } },
        phase2: { core: 0.7, major: { strength: 0.4, constitution: 0.4, magic: 0.2 }, minor: { intelligence: 0.13, luck: 0.13 } },
        phase3: { core: 0.56, major: { strength: 0.32, constitution: 0.32, magic: 0.16 }, minor: { intelligence: 0.1, luck: 0.1 } },
        phase4: { core: 0.42, major: { strength: 0.24, constitution: 0.24, magic: 0.12 }, minor: { intelligence: 0.08, luck: 0.08 } }
    };

    // 平民成长配置 - 魔力平均成长，约为幸运的0.4倍
    const COMMONER_GROWTH = {
        coreStats: ['luck'],
        majorStats: ['perception', 'intelligence', 'magic'],
        minorStats: ['strength', 'constitution', 'agility'],
        phase1: { core: 0.84, major: { perception: 0.24, intelligence: 0.24, magic: 0.2 }, minor: { strength: 0.16, constitution: 0.16, agility: 0.16 } },
        phase2: { core: 0.7, major: { perception: 0.2, intelligence: 0.2, magic: 0.17 }, minor: { strength: 0.13, constitution: 0.13, agility: 0.13 } },
        phase3: { core: 0.56, major: { perception: 0.16, intelligence: 0.16, magic: 0.13 }, minor: { strength: 0.1, constitution: 0.1, agility: 0.1 } },
        phase4: { core: 0.42, major: { perception: 0.12, intelligence: 0.12, magic: 0.1 }, minor: { strength: 0.08, constitution: 0.08, agility: 0.08 } }
    };

    const MONSTER_BASE = {
        hp: 120,
        attack: 18,
        defense: 8,
        atkSpeed: 1.2,
        moveSpeed: 3.0
    };

    const MONSTERS = {
        1: { name: '雪绒兔', img: '雪绒兔.png', hp: 120, attack: 18, defense: 8, atkSpeed: 1.3, moveSpeed: 3.8 },
        2: { name: '冰牙狼', img: '冰牙狼.png', hp: 145, attack: 22, defense: 9, atkSpeed: 1.2, moveSpeed: 3.5 },
        3: { name: '霜雪雪人', img: '霜雪雪人.png', hp: 180, attack: 20, defense: 12, atkSpeed: 1.0, moveSpeed: 2.6 },
        4: { name: '冰原野猪', img: '冰原野猪.png', hp: 210, attack: 26, defense: 14, atkSpeed: 0.9, moveSpeed: 3.2 },
        6: { name: '雪绒兔', img: '雪绒兔.png', hp: 120, attack: 18, defense: 8, atkSpeed: 1.3, moveSpeed: 3.8 },
        7: { name: '冰牙狼', img: '冰牙狼.png', hp: 145, attack: 22, defense: 9, atkSpeed: 1.2, moveSpeed: 3.5 },
        9: { name: '霜雪雪人', img: '霜雪雪人.png', hp: 180, attack: 20, defense: 12, atkSpeed: 1.0, moveSpeed: 2.6 },
        
        11: { name: '冰蛛幼崽', img: '冰蛛幼崽.png', hp: 162, attack: 24, defense: 11, atkSpeed: 1.4, moveSpeed: 3.9 },
        12: { name: '枯木守卫', img: '枯木守卫.png', hp: 180, attack: 28, defense: 13, atkSpeed: 1.1, moveSpeed: 3.0 },
        13: { name: '雪精灵', img: '雪精灵.png', hp: 150, attack: 30, defense: 9, atkSpeed: 1.3, moveSpeed: 3.8 },
        14: { name: '毒蘑菇怪', img: '毒蘑菇怪.png', hp: 200, attack: 26, defense: 16, atkSpeed: 1.0, moveSpeed: 2.7 },
        16: { name: '冰蛛幼崽', img: '冰蛛幼崽.png', hp: 162, attack: 24, defense: 11, atkSpeed: 1.4, moveSpeed: 3.9 },
        17: { name: '枯木守卫', img: '枯木守卫.png', hp: 180, attack: 28, defense: 13, atkSpeed: 1.1, moveSpeed: 3.0 },
        19: { name: '雪精灵', img: '雪精灵.png', hp: 150, attack: 30, defense: 9, atkSpeed: 1.3, moveSpeed: 3.8 },
        
        21: { name: '冰岩傀儡', img: '冰岩傀儡.png', hp: 220, attack: 32, defense: 15, atkSpeed: 0.9, moveSpeed: 2.8 },
        22: { name: '裂谷蝙蝠', img: '裂谷蝙蝠.png', hp: 180, attack: 36, defense: 10, atkSpeed: 1.4, moveSpeed: 4.0 },
        23: { name: '寒霜蜥蜴', img: '寒霜蜥蜴.png', hp: 240, attack: 34, defense: 18, atkSpeed: 1.1, moveSpeed: 3.1 },
        24: { name: '落石怪', img: '落石怪.png', hp: 280, attack: 30, defense: 22, atkSpeed: 0.8, moveSpeed: 2.6 },
        26: { name: '冰岩傀儡', img: '冰岩傀儡.png', hp: 220, attack: 32, defense: 15, atkSpeed: 0.9, moveSpeed: 2.8 },
        27: { name: '裂谷蝙蝠', img: '裂谷蝙蝠.png', hp: 180, attack: 36, defense: 10, atkSpeed: 1.4, moveSpeed: 4.0 },
        29: { name: '寒霜蜥蜴', img: '寒霜蜥蜴.png', hp: 240, attack: 34, defense: 18, atkSpeed: 1.1, moveSpeed: 3.1 },
        
        31: { name: '晶化矿工', img: '晶化矿工.png', hp: 300, attack: 42, defense: 20, atkSpeed: 1.0, moveSpeed: 3.0 },
        32: { name: '水晶蜘蛛', img: '水晶蜘蛛.png', hp: 260, attack: 48, defense: 16, atkSpeed: 1.3, moveSpeed: 3.6 },
        33: { name: '矿洞幽灵', img: '矿洞幽灵.png', hp: 240, attack: 52, defense: 14, atkSpeed: 1.2, moveSpeed: 3.5 },
        34: { name: '宝石史莱姆', img: '宝石史莱姆.png', hp: 340, attack: 40, defense: 25, atkSpeed: 0.8, moveSpeed: 2.5 },
        36: { name: '晶化矿工', img: '晶化矿工.png', hp: 300, attack: 42, defense: 20, atkSpeed: 1.0, moveSpeed: 3.0 },
        37: { name: '水晶蜘蛛', img: '水晶蜘蛛.png', hp: 260, attack: 48, defense: 16, atkSpeed: 1.3, moveSpeed: 3.6 },
        39: { name: '矿洞幽灵', img: '矿洞幽灵.png', hp: 240, attack: 52, defense: 14, atkSpeed: 1.2, moveSpeed: 3.5 },
        
        41: { name: '神殿骑士', img: '神殿骑士.png', hp: 410, attack: 55, defense: 28, atkSpeed: 1.0, moveSpeed: 2.9 },
        42: { name: '寒冰祭司', img: '寒冰祭司.png', hp: 370, attack: 65, defense: 22, atkSpeed: 1.2, moveSpeed: 3.2 },
        43: { name: '冰翼石像鬼', img: '冰翼石像鬼.png', hp: 340, attack: 60, defense: 25, atkSpeed: 1.1, moveSpeed: 3.8 },
        44: { name: '神殿守卫', img: '神殿守卫.png', hp: 460, attack: 50, defense: 32, atkSpeed: 0.9, moveSpeed: 2.7 },
        46: { name: '神殿骑士', img: '神殿骑士.png', hp: 410, attack: 55, defense: 28, atkSpeed: 1.0, moveSpeed: 2.9 },
        47: { name: '寒冰祭司', img: '寒冰祭司.png', hp: 370, attack: 65, defense: 22, atkSpeed: 1.2, moveSpeed: 3.2 },
        49: { name: '冰翼石像鬼', img: '冰翼石像鬼.png', hp: 340, attack: 60, defense: 25, atkSpeed: 1.1, moveSpeed: 3.8 },
        
        51: { name: '亡灵战士', img: '亡灵战士.png', hp: 550, attack: 72, defense: 38, atkSpeed: 0.9, moveSpeed: 2.8 },
        52: { name: '冰霜巫妖', img: '冰霜巫妖.png', hp: 480, attack: 88, defense: 32, atkSpeed: 1.2, moveSpeed: 3.1 },
        53: { name: '墓穴蠕虫', img: '墓穴蠕虫.png', hp: 620, attack: 68, defense: 45, atkSpeed: 0.7, moveSpeed: 2.4 },
        54: { name: '骷髅弓箭手', img: '骷髅弓箭手.png', hp: 450, attack: 92, defense: 28, atkSpeed: 1.3, moveSpeed: 3.3 },
        56: { name: '亡灵战士', img: '亡灵战士.png', hp: 550, attack: 72, defense: 38, atkSpeed: 0.9, moveSpeed: 2.8 },
        57: { name: '冰霜巫妖', img: '冰霜巫妖.png', hp: 480, attack: 88, defense: 32, atkSpeed: 1.2, moveSpeed: 3.1 },
        59: { name: '墓穴蠕虫', img: '墓穴蠕虫.png', hp: 620, attack: 68, defense: 45, atkSpeed: 0.7, moveSpeed: 2.4 },
        
        61: { name: '冰元素', img: '冰元素.png', hp: 730, attack: 92, defense: 50, atkSpeed: 1.1, moveSpeed: 3.2 },
        62: { name: '水元素', img: '水元素.png', hp: 680, attack: 100, defense: 46, atkSpeed: 1.2, moveSpeed: 3.4 },
        63: { name: '寒霜元素', img: '寒霜元素.png', hp: 780, attack: 88, defense: 55, atkSpeed: 1.0, moveSpeed: 3.0 },
        64: { name: '蒸汽元素', img: '蒸汽元素.png', hp: 660, attack: 105, defense: 42, atkSpeed: 1.3, moveSpeed: 3.6 },
        66: { name: '冰元素', img: '冰元素.png', hp: 730, attack: 92, defense: 50, atkSpeed: 1.1, moveSpeed: 3.2 },
        67: { name: '水元素', img: '水元素.png', hp: 680, attack: 100, defense: 46, atkSpeed: 1.2, moveSpeed: 3.4 },
        69: { name: '寒霜元素', img: '寒霜元素.png', hp: 780, attack: 88, defense: 55, atkSpeed: 1.0, moveSpeed: 3.0 },
        
        71: { name: '冰龙幼崽', img: '冰龙幼崽.png', hp: 980, attack: 118, defense: 65, atkSpeed: 1.0, moveSpeed: 3.2 },
        72: { name: '龙人战士', img: '龙人战士.png', hp: 900, attack: 130, defense: 60, atkSpeed: 1.1, moveSpeed: 3.1 },
        73: { name: '龙息法师', img: '龙息法师.png', hp: 850, attack: 145, defense: 54, atkSpeed: 1.2, moveSpeed: 3.3 },
        74: { name: '龙蛋守卫', img: '龙蛋守卫.png', hp: 1050, attack: 110, defense: 75, atkSpeed: 0.8, moveSpeed: 2.8 },
        76: { name: '冰龙幼崽', img: '冰龙幼崽.png', hp: 980, attack: 118, defense: 65, atkSpeed: 1.0, moveSpeed: 3.2 },
        77: { name: '龙人战士', img: '龙人战士.png', hp: 900, attack: 130, defense: 60, atkSpeed: 1.1, moveSpeed: 3.1 },
        79: { name: '龙息法师', img: '龙息法师.png', hp: 850, attack: 145, defense: 54, atkSpeed: 1.2, moveSpeed: 3.3 },
        
        81: { name: '远古战士', img: '远古战士.png', hp: 1300, attack: 150, defense: 82, atkSpeed: 0.9, moveSpeed: 2.9 },
        82: { name: '战争傀儡', img: '战争傀儡.png', hp: 1450, attack: 140, defense: 95, atkSpeed: 0.7, moveSpeed: 2.5 },
        83: { name: '怨灵骑士', img: '怨灵骑士.png', hp: 1200, attack: 165, defense: 75, atkSpeed: 1.1, moveSpeed: 3.2 },
        84: { name: '战场幽灵', img: '战场幽灵.png', hp: 1150, attack: 175, defense: 68, atkSpeed: 1.2, moveSpeed: 3.5 },
        86: { name: '远古战士', img: '远古战士.png', hp: 1300, attack: 150, defense: 82, atkSpeed: 0.9, moveSpeed: 2.9 },
        87: { name: '战争傀儡', img: '战争傀儡.png', hp: 1450, attack: 140, defense: 95, atkSpeed: 0.7, moveSpeed: 2.5 },
        89: { name: '怨灵骑士', img: '怨灵骑士.png', hp: 1200, attack: 165, defense: 75, atkSpeed: 1.1, moveSpeed: 3.2 },
        
        91: { name: '王座守卫', img: '王座守卫.png', hp: 1750, attack: 185, defense: 105, atkSpeed: 0.9, moveSpeed: 2.8 },
        92: { name: '寒冰使徒', img: '寒冰使徒.png', hp: 1600, attack: 205, defense: 98, atkSpeed: 1.0, moveSpeed: 3.1 },
        93: { name: '虚空行者', img: '虚空行者.png', hp: 1500, attack: 220, defense: 92, atkSpeed: 1.1, moveSpeed: 3.4 },
        94: { name: '永冻之魂', img: '永冻之魂.png', hp: 1850, attack: 175, defense: 115, atkSpeed: 0.8, moveSpeed: 2.6 },
        96: { name: '王座守卫', img: '王座守卫.png', hp: 1750, attack: 185, defense: 105, atkSpeed: 0.9, moveSpeed: 2.8 },
        97: { name: '寒冰使徒', img: '寒冰使徒.png', hp: 1600, attack: 205, defense: 98, atkSpeed: 1.0, moveSpeed: 3.1 },
        99: { name: '虚空行者', img: '虚空行者.png', hp: 1500, attack: 220, defense: 92, atkSpeed: 1.1, moveSpeed: 3.4 },
    };

    const ELITE_MONSTERS = {
        5: { name: '雪原狼王', img: '雪原狼王.png', hp: 464, attack: 55, defense: 18, atkSpeed: 1.25, moveSpeed: 3.6 },
        8: { name: '巨型雪人', img: '巨形雪人.png', hp: 576, attack: 50, defense: 24, atkSpeed: 0.95, moveSpeed: 2.5 },
        
        15: { name: '冰蛛女王', img: '冰蛛女王.png', hp: 625, attack: 72, defense: 30, atkSpeed: 1.15, moveSpeed: 3.3 },
        18: { name: '腐化树精', img: '腐化树精.png', hp: 710, attack: 85, defense: 36, atkSpeed: 0.9, moveSpeed: 2.8 },
        
        25: { name: '熔岩冰傀儡', img: '熔岩冰傀儡.png', hp: 850, attack: 98, defense: 40, atkSpeed: 0.95, moveSpeed: 2.7 },
        28: { name: '巨型蝙蝠王', img: '巨型蝙蝠王.png', hp: 960, attack: 112, defense: 46, atkSpeed: 1.1, moveSpeed: 3.8 },
        
        35: { name: '晶化工头', img: '晶化工头.png', hp: 1150, attack: 128, defense: 52, atkSpeed: 0.9, moveSpeed: 2.8 },
        38: { name: '水晶巨蛛', img: '水晶巨蛛.png', hp: 1300, attack: 145, defense: 60, atkSpeed: 1.05, moveSpeed: 3.3 },
        
        45: { name: '神殿骑士长', img: '神殿骑士长.png', hp: 1550, attack: 168, defense: 68, atkSpeed: 0.85, moveSpeed: 2.7 },
        48: { name: '大祭司助手', img: '大祭司助手.png', hp: 1750, attack: 190, defense: 78, atkSpeed: 1.0, moveSpeed: 3.1 },
        
        55: { name: '巫妖领主', img: '巫妖领主.png', hp: 2100, attack: 215, defense: 88, atkSpeed: 0.8, moveSpeed: 2.8 },
        58: { name: '巨型墓穴蠕虫', img: '巨型墓穴蠕虫.png', hp: 2350, attack: 240, defense: 98, atkSpeed: 0.7, moveSpeed: 2.4 },
        
        65: { name: '元素融合体', img: '元素融合体.png', hp: 2800, attack: 275, defense: 110, atkSpeed: 0.75, moveSpeed: 2.9 },
        68: { name: '虚空元素', img: '虚空元素.png', hp: 3100, attack: 305, defense: 122, atkSpeed: 0.9, moveSpeed: 3.2 },
        
        75: { name: '龙人将军', img: '龙人将军.png', hp: 3750, attack: 345, defense: 138, atkSpeed: 0.7, moveSpeed: 2.7 },
        78: { name: '成年冰龙', img: '成年冰龙.png', hp: 4100, attack: 380, defense: 152, atkSpeed: 0.85, moveSpeed: 3.4 },
        
        85: { name: '远古战神', img: '远古战神.png', hp: 4950, attack: 430, defense: 172, atkSpeed: 0.65, moveSpeed: 2.6 },
        88: { name: '巨型战争傀儡', img: '巨型战争傀儡.png', hp: 5400, attack: 470, defense: 188, atkSpeed: 0.8, moveSpeed: 3.0 },
        
        95: { name: '寒冰大天使', img: '寒冰大天使.png', hp: 6500, attack: 530, defense: 215, atkSpeed: 0.6, moveSpeed: 2.8 },
        98: { name: '虚空领主', img: '虚空领主.png', hp: 7100, attack: 580, defense: 235, atkSpeed: 0.75, moveSpeed: 3.2 },
    };

    const BOSS_MONSTERS = {
        10: { name: '雪原领主·格伦', img: '雪原领主格伦.png', hp: 3780, attack: 156, defense: 63, atkSpeed: 1.0, moveSpeed: 2.9 },
        20: { name: '森林守望者·艾拉', img: '森林守望者艾拉.png', hp: 5100, attack: 210, defense: 85, atkSpeed: 1.0, moveSpeed: 3.0 },
        30: { name: '峡谷巨兽·洛克', img: '峡谷巨兽洛克.png', hp: 6900, attack: 275, defense: 110, atkSpeed: 1.0, moveSpeed: 2.8 },
        40: { name: '晶化巨像·克里斯特', img: '晶化巨像克里斯特.png', hp: 9300, attack: 355, defense: 142, atkSpeed: 1.0, moveSpeed: 2.5 },
        50: { name: '神殿大祭司·伊芙琳', img: '神殿大祭司伊芙琳.png', hp: 12500, attack: 450, defense: 180, atkSpeed: 1.0, moveSpeed: 3.0 },
        60: { name: '墓穴君王·阿尔萨斯', img: '墓穴君王阿尔萨斯.png', hp: 16800, attack: 575, defense: 225, atkSpeed: 1.0, moveSpeed: 2.9 },
        70: { name: '元素领主·埃欧努斯', img: '元素领主埃欧努斯.png', hp: 22600, attack: 720, defense: 280, atkSpeed: 1.0, moveSpeed: 3.1 },
        80: { name: '冰龙女王·希瓦娜', img: '冰龙女王希瓦娜.png', hp: 30500, attack: 900, defense: 345, atkSpeed: 1.0, moveSpeed: 3.5 },
        90: { name: '战争统帅·马格努斯', img: '战争统帅马格努斯.png', hp: 41200, attack: 1120, defense: 420, atkSpeed: 1.0, moveSpeed: 3.0 },
        100: { name: '冰封女王·艾莎', img: '冰封女王艾莎.png', hp: 55800, attack: 1380, defense: 510, atkSpeed: 1.0, moveSpeed: 3.2 },
    };

    const DUNGEON_ZONES = [
        { name: '外围雪原', floors: '1-10层' },
        { name: '冰封黑森林', floors: '11-20层' },
        { name: '冰裂峡谷', floors: '21-30层' },
        { name: '冰晶矿洞', floors: '31-40层' },
        { name: '永冻神殿', floors: '41-50层' },
        { name: '冰封墓穴', floors: '51-60层' },
        { name: '元素裂隙', floors: '61-70层' },
        { name: '冰龙巢穴', floors: '71-80层' },
        { name: '远古战场', floors: '81-90层' },
        { name: '冰封王座', floors: '91-100层' },
    ];

    const PET_RARITY = {
        COMMON: '普通',
        RARE: '稀有',
        EPIC: '史诗',
        LEGENDARY: '传说'
    };

    const PET_TEMPLATES = {
        '雪绒兔': { name: '雪绒兔', rarity: PET_RARITY.COMMON, baseHp: 50, baseAtk: 8, img: '雪绒兔.png' },
        '冰牙狼': { name: '冰牙狼', rarity: PET_RARITY.RARE, baseHp: 70, baseAtk: 12, img: '冰牙狼.png' },
        '霜雪雪人': { name: '霜雪雪人', rarity: PET_RARITY.RARE, baseHp: 90, baseAtk: 10, img: '霜雪雪人.png' },
        '冰原野猪': { name: '冰原野猪', rarity: PET_RARITY.EPIC, baseHp: 120, baseAtk: 15, img: '冰原野猪.png' },
        '雪原狼王': { name: '雪原狼王', rarity: PET_RARITY.LEGENDARY, baseHp: 200, baseAtk: 25, img: '雪原狼王.png' },
        '巨型雪人': { name: '巨型雪人', rarity: PET_RARITY.LEGENDARY, baseHp: 250, baseAtk: 22, img: '巨形雪人.png' },
        '雪原领主·格伦': { name: '雪原领主·格伦', rarity: PET_RARITY.LEGENDARY, baseHp: 380, baseAtk: 32, img: '雪原领主格伦.png' },
        '森林守望者·艾拉': { name: '森林守望者·艾拉', rarity: PET_RARITY.LEGENDARY, baseHp: 510, baseAtk: 42, img: '森林守望者艾拉.png' },
        '峡谷巨兽·洛克': { name: '峡谷巨兽·洛克', rarity: PET_RARITY.LEGENDARY, baseHp: 690, baseAtk: 55, img: '峡谷巨兽洛克.png' },
        '晶化巨像·克里斯特': { name: '晶化巨像·克里斯特', rarity: PET_RARITY.LEGENDARY, baseHp: 930, baseAtk: 71, img: '晶化巨像克里斯特.png' },
        '神殿大祭司·伊芙琳': { name: '神殿大祭司·伊芙琳', rarity: PET_RARITY.LEGENDARY, baseHp: 1250, baseAtk: 90, img: '神殿大祭司伊芙琳.png' },
        '墓穴君王·阿尔萨斯': { name: '墓穴君王·阿尔萨斯', rarity: PET_RARITY.LEGENDARY, baseHp: 1680, baseAtk: 115, img: '墓穴君王阿尔萨斯.png' },
        '元素领主·埃欧努斯': { name: '元素领主·埃欧努斯', rarity: PET_RARITY.LEGENDARY, baseHp: 2260, baseAtk: 144, img: '元素领主埃欧努斯.png' },
        '冰龙女王·希瓦娜': { name: '冰龙女王·希瓦娜', rarity: PET_RARITY.LEGENDARY, baseHp: 3050, baseAtk: 180, img: '冰龙女王希瓦娜.png' },
        '战争统帅·马格努斯': { name: '战争统帅·马格努斯', rarity: PET_RARITY.LEGENDARY, baseHp: 4120, baseAtk: 224, img: '战争统帅马格努斯.png' },
        '冰封女王·艾莎': { name: '冰封女王·艾莎', rarity: PET_RARITY.LEGENDARY, baseHp: 5580, baseAtk: 276, img: '冰封女王艾莎.png' },
    };

    const EQUIPMENT_RARITY = {
        BLUE: 'blue',
        PURPLE: 'purple',
        ORANGE: 'orange',
        RED: 'red'
    };

    const EQUIPMENT_TYPE = {
        WEAPON: 'weapon',
        HEAD: 'head',
        CHEST: 'chest',
        LEGS: 'legs',
        BOOTS: 'boots',
        ACCESSORY: 'accessory'
    };

    const EQUIPMENT = {
        // 狂战套装 (紫色品质)
        '狂战钢剑': { name: '狂战钢剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '狂战', price: 5000, props: { attack: 50 }, growth: { attack: 5 } },
        '狂战头盔': { name: '狂战头盔', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '狂战', price: 3000, props: { defense: 15, maxHp: 100 }, growth: { defense: 1, maxHp: 10 } },
        '狂战藤甲': { name: '狂战藤甲', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '狂战', price: 3500, props: { defense: 20, maxHp: 150 }, growth: { defense: 2, maxHp: 15 } },
        '狂战短裤': { name: '狂战短裤', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '狂战', price: 2500, props: { defense: 12, attack: 10 }, growth: { defense: 1, attack: 1 } },
        '狂战靴子': { name: '狂战靴子', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '狂战', price: 2000, props: { speed: 5, maxHp: 50 }, growth: { speed: 0.5, maxHp: 5 } },
        '狂战戒指': { name: '狂战戒指', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '狂战', price: 4000, props: { attack: 20, criticalRate: 0.05 }, growth: { attack: 2, criticalRate: 0.005 } },
        
        // 游侠套装 (紫色品质)
        '游侠长弓': { name: '游侠长弓', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '游侠', price: 5000, props: { attack: 45, speed: 10 }, growth: { attack: 4, speed: 1 } },
        '游侠兜帽': { name: '游侠兜帽', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '游侠', price: 3000, props: { defense: 10, criticalRate: 0.05 }, growth: { defense: 1, criticalRate: 0.005 } },
        '游侠皮衣': { name: '游侠皮衣', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '游侠', price: 3500, props: { defense: 15, speed: 5 }, growth: { defense: 1, speed: 0.5 } },
        '游侠裤子': { name: '游侠裤子', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '游侠', price: 2500, props: { defense: 10, attack: 15 }, growth: { defense: 1, attack: 1 } },
        '游侠战靴': { name: '游侠战靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '游侠', price: 2000, props: { speed: 15, dodgeRate: 0.05 }, growth: { speed: 1.5, dodgeRate: 0.005 } },
        '游侠信物': { name: '游侠信物', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '游侠', price: 4000, props: { criticalRate: 0.1, attack: 15 }, growth: { criticalRate: 0.01, attack: 1 } },
        
        // 牧师套装 (紫色品质)
        '牧师法杖': { name: '牧师法杖', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '牧师', price: 5000, props: { magic: 60, attack: 30 }, growth: { magic: 6, attack: 3 } },
        '牧师冠冕': { name: '牧师冠冕', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '牧师', price: 3000, props: { maxHp: 80, magic: 20 }, growth: { maxHp: 8, magic: 2 } },
        '牧师法袍': { name: '牧师法袍', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '牧师', price: 3500, props: { defense: 12, magic: 30, maxHp: 100 }, growth: { defense: 1, magic: 3, maxHp: 10 } },
        '牧师裤子': { name: '牧师裤子', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '牧师', price: 2500, props: { defense: 8, magic: 15 }, growth: { defense: 1, magic: 1 } },
        '牧师靴子': { name: '牧师靴子', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '牧师', price: 2000, props: { speed: 5, magicRegen: 2 }, growth: { speed: 0.5, magicRegen: 0.2 } },
        '牧师宝石': { name: '牧师宝石', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '牧师', price: 4000, props: { magic: 25, maxHp: 50 }, growth: { magic: 2, maxHp: 5 } },
        
        // 法师套装 (紫色品质)
        '法师法杖': { name: '法师法杖', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '法师', price: 5000, props: { magic: 80, attack: 20 }, growth: { magic: 8, attack: 2 } },
        '法师假面': { name: '法师假面', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '法师', price: 3000, props: { magic: 25, magicRegen: 3 }, growth: { magic: 2, magicRegen: 0.3 } },
        '法师长袍': { name: '法师长袍', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '法师', price: 3500, props: { defense: 10, magic: 40 }, growth: { defense: 1, magic: 4 } },
        '法师护腿': { name: '法师护腿', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '法师', price: 2500, props: { defense: 8, magic: 20 }, growth: { defense: 1, magic: 2 } },
        '法师冰靴': { name: '法师冰靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '法师', price: 2000, props: { speed: 8, magic: 10 }, growth: { speed: 0.8, magic: 1 } },
        '法师宝石': { name: '法师宝石', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '法师', price: 4000, props: { magic: 30, criticalRate: 0.05 }, growth: { magic: 3, criticalRate: 0.005 } },
        
        // 盾骑套装 (紫色品质)
        '盾骑之剑': { name: '盾骑之剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '盾骑', price: 5000, props: { attack: 35, defense: 20 }, growth: { attack: 3, defense: 2 } },
        '盾骑头盔': { name: '盾骑头盔', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '盾骑', price: 3000, props: { defense: 25, maxHp: 150 }, growth: { defense: 2, maxHp: 15 } },
        '盾骑护甲': { name: '盾骑护甲', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '盾骑', price: 3500, props: { defense: 35, maxHp: 200 }, growth: { defense: 3, maxHp: 20 } },
        '盾骑护腿': { name: '盾骑护腿', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '盾骑', price: 2500, props: { defense: 20, maxHp: 100 }, growth: { defense: 2, maxHp: 10 } },
        '盾骑之靴': { name: '盾骑之靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '盾骑', price: 2000, props: { defense: 10, speed: 3 }, growth: { defense: 1, speed: 0.3 } },
        '盾骑徽章': { name: '盾骑徽章', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '盾骑', price: 4000, props: { defense: 15, maxHp: 100 }, growth: { defense: 1, maxHp: 10 } },
        
        // 武僧套装 (紫色品质)
        '武僧拳套': { name: '武僧拳套', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '武僧', price: 5000, props: { attack: 40, defense: 15 }, growth: { attack: 4, defense: 1 } },
        '武僧头巾': { name: '武僧头巾', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '武僧', price: 3000, props: { maxHp: 100, dodgeRate: 0.05 }, growth: { maxHp: 10, dodgeRate: 0.005 } },
        '武僧衣袍': { name: '武僧衣袍', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '武僧', price: 3500, props: { defense: 18, maxHp: 150 }, growth: { defense: 1, maxHp: 15 } },
        '武僧裤子': { name: '武僧裤子', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '武僧', price: 2500, props: { defense: 12, attack: 10 }, growth: { defense: 1, attack: 1 } },
        '武僧鞋子': { name: '武僧鞋子', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '武僧', price: 2000, props: { speed: 12, dodgeRate: 0.05 }, growth: { speed: 1, dodgeRate: 0.005 } },
        '武僧项链': { name: '武僧项链', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '武僧', price: 4000, props: { attack: 15, defense: 10 }, growth: { attack: 1, defense: 1 } },
        
        // 平民套装 (紫色品质)
        '平民黑剑': { name: '平民黑剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.PURPLE, class: '平民', price: 5000, props: { attack: 38, criticalRate: 0.05 }, growth: { attack: 3, criticalRate: 0.005 } },
        '平民面具': { name: '平民面具', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.PURPLE, class: '平民', price: 3000, props: { defense: 12, criticalRate: 0.03 }, growth: { defense: 1, criticalRate: 0.003 } },
        '平民风衣': { name: '平民风衣', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.PURPLE, class: '平民', price: 3500, props: { defense: 16, speed: 8 }, growth: { defense: 1, speed: 0.8 } },
        '平民皮裤': { name: '平民皮裤', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.PURPLE, class: '平民', price: 2500, props: { defense: 10, speed: 5 }, growth: { defense: 1, speed: 0.5 } },
        '平民长靴': { name: '平民长靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.PURPLE, class: '平民', price: 2000, props: { speed: 10, maxHp: 50 }, growth: { speed: 1, maxHp: 5 } },
        '平民硬币': { name: '平民硬币', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.PURPLE, class: '平民', price: 4000, props: { goldBonus: 0.1, criticalRate: 0.05 }, growth: { goldBonus: 0.01, criticalRate: 0.005 } },
        
        // 旅人套 (蓝色品质，全职业通用)
        '旅人长剑': { name: '旅人长剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: 2000, props: { attack: 25 }, growth: { attack: 2 } },
        '旅人帽子': { name: '旅人帽子', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: 1200, props: { defense: 8, maxHp: 50 }, growth: { defense: 1, maxHp: 5 } },
        '旅人皮甲': { name: '旅人皮甲', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: 1400, props: { defense: 12, maxHp: 80 }, growth: { defense: 1, maxHp: 8 } },
        '旅人长裤': { name: '旅人长裤', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: 1000, props: { defense: 6, attack: 5 }, growth: { defense: 1, attack: 0.5 } },
        '旅人靴子': { name: '旅人靴子', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: 800, props: { speed: 5, maxHp: 30 }, growth: { speed: 0.5, maxHp: 3 } },
        '旅人徽章': { name: '旅人徽章', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: 1600, props: { attack: 10, defense: 5 }, growth: { attack: 1, defense: 0.5 } },
        
        // 新手套装 (蓝色品质，全职业通用，可升级)
        '新手铁剑': { name: '新手铁剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: null, props: { attack: 20, defense: 5 }, growth: { attack: 2, defense: 1 } },
        '新手草帽': { name: '新手草帽', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: null, props: { defense: 10, maxHp: 50 }, growth: { defense: 1, maxHp: 10 } },
        '新手上衣': { name: '新手上衣', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: null, props: { defense: 15, maxHp: 80 }, growth: { defense: 1, maxHp: 10 } },
        '新手裤子': { name: '新手裤子', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: null, props: { defense: 8, attack: 5 }, growth: { defense: 1, attack: 0.5 } },
        '新手靴子': { name: '新手靴子', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: null, props: { speed: 5, maxHp: 30 }, growth: { speed: 0.5, maxHp: 5 } },
        '新手护符': { name: '新手护符', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.BLUE, class: 'all', price: null, props: { attack: 10, criticalRate: 0.03 }, growth: { attack: 1, criticalRate: 0.003 } },
        
        // 帝套 (橙色品质，全职业通用，进化币购买)
        '帝霜冰剑': { name: '帝霜冰剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 25, currency: 'evoCoin', props: { attack: 140, criticalRate: 0.14 }, growth: { attack: 14, criticalRate: 0.014 } },
        '帝鬼魔盔': { name: '帝鬼魔盔', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 15, currency: 'evoCoin', props: { defense: 48, maxHp: 380, criticalRate: 0.05 }, growth: { defense: 4.8, maxHp: 38, criticalRate: 0.005 } },
        '帝冥骨甲': { name: '帝冥骨甲', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 18, currency: 'evoCoin', props: { defense: 68, maxHp: 580 }, growth: { defense: 6.8, maxHp: 58 } },
        '帝棘之裤': { name: '帝棘之裤', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 12, currency: 'evoCoin', props: { defense: 38, attack: 28 }, growth: { defense: 3.8, attack: 2.8 } },
        '帝炎之靴': { name: '帝炎之靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 10, currency: 'evoCoin', props: { speed: 28, attack: 22 }, growth: { speed: 2.8, attack: 2.2 } },
        '帝渊之眼': { name: '帝渊之眼', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 20, currency: 'evoCoin', props: { attack: 52, magic: 52, criticalRate: 0.1 }, growth: { attack: 5.2, magic: 5.2, criticalRate: 0.01 } },

        // 洋流套 (橙色品质，全职业通用，金币购买，极贵)
        '洋流之剑': { name: '洋流之剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 80000, props: { attack: 120, criticalRate: 0.12 }, growth: { attack: 12, criticalRate: 0.012 } },
        '洋流头盔': { name: '洋流头盔', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 50000, props: { defense: 40, maxHp: 300 }, growth: { defense: 4, maxHp: 30 } },
        '洋流上衣': { name: '洋流上衣', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 60000, props: { defense: 60, maxHp: 500 }, growth: { defense: 6, maxHp: 50 } },
        '洋流裤子': { name: '洋流裤子', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 45000, props: { defense: 35, attack: 25 }, growth: { defense: 3.5, attack: 2.5 } },
        '洋流鞋子': { name: '洋流鞋子', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 40000, props: { speed: 25, attack: 18 }, growth: { speed: 2.5, attack: 1.8 } },
        '洋流项链': { name: '洋流项链', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 55000, props: { attack: 45, magic: 45 }, growth: { attack: 4.5, magic: 4.5 } },

        // 天使套 (橙色品质，全职业通用，钻石购买)
        '天使光剑': { name: '天使光剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 100, currency: 'diamond', props: { attack: 130, criticalRate: 0.13 }, growth: { attack: 13, criticalRate: 0.013 } },
        '天使头环': { name: '天使头环', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 60, currency: 'diamond', props: { defense: 45, maxHp: 350 }, growth: { defense: 4.5, maxHp: 35 } },
        '天使护甲': { name: '天使护甲', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 80, currency: 'diamond', props: { defense: 65, maxHp: 550 }, growth: { defense: 6.5, maxHp: 55 } },
        '天使之裙': { name: '天使之裙', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 55, currency: 'diamond', props: { defense: 38, attack: 28 }, growth: { defense: 3.8, attack: 2.8 } },
        '天使之靴': { name: '天使之靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 50, currency: 'diamond', props: { speed: 28, attack: 20 }, growth: { speed: 2.8, attack: 2 } },
        '天使信物': { name: '天使信物', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.ORANGE, class: 'all', price: 70, currency: 'diamond', props: { attack: 50, magic: 50 }, growth: { attack: 5, magic: 5 } },

        // 暗黑套 (红色品质，全职业通用，钻石购买，极贵，稍低于创世套)
        '暗黑神剑': { name: '暗黑神剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 280, currency: 'diamond', props: { attack: 260, criticalRate: 0.25 }, growth: { attack: 26, criticalRate: 0.025 } },
        '暗黑神冠': { name: '暗黑神冠', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 180, currency: 'diamond', props: { defense: 85, maxHp: 850, criticalRate: 0.08 }, growth: { defense: 8.5, maxHp: 85, criticalRate: 0.008 } },
        '暗黑神袍': { name: '暗黑神袍', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 220, currency: 'diamond', props: { defense: 130, maxHp: 1300, magic: 80 }, growth: { defense: 13, maxHp: 130, magic: 8 } },
        '暗黑神护腿': { name: '暗黑神护腿', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 160, currency: 'diamond', props: { defense: 70, attack: 50, magic: 40 }, growth: { defense: 7, attack: 5, magic: 4 } },
        '暗黑神靴': { name: '暗黑神靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 150, currency: 'diamond', props: { speed: 45, attack: 35, magic: 35 }, growth: { speed: 4.5, attack: 3.5, magic: 3.5 } },
        '暗黑令牌': { name: '暗黑令牌', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 200, currency: 'diamond', props: { attack: 85, magic: 85, criticalRate: 0.15 }, growth: { attack: 8.5, magic: 8.5, criticalRate: 0.015 } },

        // 龙神套 (红色品质，全职业通用，进化币购买，稍低于创世套)
        '龙神之剑': { name: '龙神之剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 40, currency: 'evoCoin', props: { attack: 270, criticalRate: 0.26 }, growth: { attack: 27, criticalRate: 0.026 } },
        '龙神之盔': { name: '龙神之盔', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 25, currency: 'evoCoin', props: { defense: 88, maxHp: 880, criticalRate: 0.09 }, growth: { defense: 8.8, maxHp: 88, criticalRate: 0.009 } },
        '龙神之衣': { name: '龙神之衣', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 32, currency: 'evoCoin', props: { defense: 135, maxHp: 1350, magic: 85 }, growth: { defense: 13.5, maxHp: 135, magic: 8.5 } },
        '龙神之裤': { name: '龙神之裤', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 22, currency: 'evoCoin', props: { defense: 72, attack: 52, magic: 42 }, growth: { defense: 7.2, attack: 5.2, magic: 4.2 } },
        '龙神之靴': { name: '龙神之靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 20, currency: 'evoCoin', props: { speed: 46, attack: 36, magic: 36 }, growth: { speed: 4.6, attack: 3.6, magic: 3.6 } },
        '龙神之蛋': { name: '龙神之蛋', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: 28, currency: 'evoCoin', props: { attack: 88, magic: 88, criticalRate: 0.16 }, growth: { attack: 8.8, magic: 8.8, criticalRate: 0.016 } },

        // 创世套 (红色品质，全职业通用，非卖品)
        '创世神剑': { name: '创世神剑', type: EQUIPMENT_TYPE.WEAPON, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: null, props: { attack: 300, criticalRate: 0.3 }, growth: { attack: 30, criticalRate: 0.03 } },
        '创世神盔': { name: '创世神盔', type: EQUIPMENT_TYPE.HEAD, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: null, props: { defense: 100, maxHp: 1000, criticalRate: 0.1 }, growth: { defense: 10, maxHp: 100, criticalRate: 0.01 } },
        '创世神袍': { name: '创世神袍', type: EQUIPMENT_TYPE.CHEST, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: null, props: { defense: 150, maxHp: 1500, magic: 100 }, growth: { defense: 15, maxHp: 150, magic: 10 } },
        '创世神裤': { name: '创世神裤', type: EQUIPMENT_TYPE.LEGS, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: null, props: { defense: 80, attack: 60, magic: 50 }, growth: { defense: 8, attack: 6, magic: 5 } },
        '创世神靴': { name: '创世神靴', type: EQUIPMENT_TYPE.BOOTS, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: null, props: { speed: 50, attack: 40, magic: 40 }, growth: { speed: 5, attack: 4, magic: 4 } },
        '创世神戒': { name: '创世神戒', type: EQUIPMENT_TYPE.ACCESSORY, rarity: EQUIPMENT_RARITY.RED, class: 'all', price: null, props: { attack: 100, magic: 100, criticalRate: 0.2 }, growth: { attack: 10, magic: 10, criticalRate: 0.02 } }
    };

    const ITEMS = {
        // 血瓶
        '初级血瓶': { name: '初级血瓶', icon: '🧪', type: 'heal', effect: 0.1, price: 100, currency: 'gold', desc: '回复10%生命' },
        '中级血瓶': { name: '中级血瓶', icon: '🧪', type: 'heal', effect: 0.3, price: 300, currency: 'gold', desc: '回复30%生命' },
        '高级血瓶': { name: '高级血瓶', icon: '🧪', type: 'heal', effect: 0.5, price: 600, currency: 'gold', desc: '回复50%生命' },
        '生命之水': { name: '生命之水', icon: '💧', type: 'heal', effect: 1.0, price: 50, currency: 'diamond', desc: '回复100%生命' },
        
        // 魔瓶
        '初级魔瓶': { name: '初级魔瓶', icon: '💎', type: 'mana', effect: 0.1, price: 150, currency: 'gold', desc: '回复10%魔力' },
        '中级魔瓶': { name: '中级魔瓶', icon: '💎', type: 'mana', effect: 0.3, price: 450, currency: 'gold', desc: '回复30%魔力' },
        '高级魔瓶': { name: '高级魔瓶', icon: '💎', type: 'mana', effect: 0.5, price: 900, currency: 'gold', desc: '回复50%魔力' },
        '附魔之水': { name: '附魔之水', icon: '✨', type: 'mana', effect: 1.0, price: 70, currency: 'diamond', desc: '回复100%魔力' },
        
        // 经验瓶
        '小经验瓶': { name: '小经验瓶', icon: '⭐', type: 'exp', effect: 500, price: 200, currency: 'gold', desc: '获得500经验' },
        '中经验瓶': { name: '中经验瓶', icon: '⭐', type: 'exp', effect: 1500, price: 600, currency: 'gold', desc: '获得1500经验' },
        '大经验瓶': { name: '大经验瓶', icon: '⭐', type: 'exp', effect: 3000, price: 1200, currency: 'gold', desc: '获得3000经验' },
        '经验圣典': { name: '经验圣典', icon: '📖', type: 'exp', effect: 10000, price: 100, currency: 'diamond', desc: '获得10000经验' },
        
        // 卷轴
        '暴戾卷轴': { name: '暴戾卷轴', icon: '📜', type: 'buff', effect: { criticalRate: 0.05 }, price: 500, currency: 'gold', desc: '本场战斗暴击率+5%' },
        '金甲卷轴': { name: '金甲卷轴', icon: '📜', type: 'buff', effect: { defense: 0.2 }, price: 500, currency: 'gold', desc: '本场战斗防御+20%' },
        '飓风卷轴': { name: '飓风卷轴', icon: '📜', type: 'buff', effect: { speed: 0.2 }, price: 500, currency: 'gold', desc: '本场战斗攻击速度+20%' },
        '威能卷轴': { name: '威能卷轴', icon: '📜', type: 'buff', effect: { attack: 0.2 }, price: 500, currency: 'gold', desc: '本场战斗攻击+20%' },
        '通灵卷轴': { name: '通灵卷轴', icon: '📜', type: 'tame', effect: { type: 'normal' }, price: 50, currency: 'diamond', desc: '使用后直接驯服普通怪' },
        '契约卷轴': { name: '契约卷轴', icon: '📜', type: 'tame', effect: { type: 'elite' }, price: 300, currency: 'diamond', desc: '使用后直接驯服精英怪' },
        '创世契约': { name: '创世契约', icon: '📜', type: 'tame', effect: { type: 'all' }, price: null, desc: '使用后驯服任意怪包括BOSS' }
    };

    const GIFTPACKS = {
        starter: {
            id: 'starter',
            name: '新手礼包',
            desc: '新手六件套+初级血瓶+初级魔瓶',
            price: 0,
            currency: 'free',
            limit: 1,
            items: [
                { name: '新手铁剑', type: 'equipment' },
                { name: '新手草帽', type: 'equipment' },
                { name: '新手上衣', type: 'equipment' },
                { name: '新手裤子', type: 'equipment' },
                { name: '新手靴子', type: 'equipment' },
                { name: '新手护符', type: 'equipment' },
                { name: '初级血瓶', type: 'item', quantity: 3 },
                { name: '初级魔瓶', type: 'item', quantity: 3 }
            ]
        },
        scroll: {
            id: 'scroll',
            name: '卷轴家族礼包',
            desc: '暴戾、金甲、飓风、威能卷轴各10张',
            price: 99,
            currency: 'diamond',
            limit: null,
            items: [
                { name: '暴戾卷轴', type: 'item', quantity: 10 },
                { name: '金甲卷轴', type: 'item', quantity: 10 },
                { name: '飓风卷轴', type: 'item', quantity: 10 },
                { name: '威能卷轴', type: 'item', quantity: 10 }
            ]
        },
        exp: {
            id: 'exp',
            name: '葵花宝典礼包',
            desc: '大/中/小经验瓶超值组合',
            price: 199,
            currency: 'diamond',
            limit: null,
            items: [
                { name: '大经验瓶', type: 'item', quantity: 3 },
                { name: '中经验瓶', type: 'item', quantity: 5 },
                { name: '小经验瓶', type: 'item', quantity: 10 }
            ]
        },
        tame: {
            id: 'tame',
            name: '凌驾大师礼包',
            desc: '契约卷轴+通灵卷轴',
            price: 299,
            currency: 'diamond',
            limit: null,
            items: [
                { name: '契约卷轴', type: 'item', quantity: 1 },
                { name: '通灵卷轴', type: 'item', quantity: 1 }
            ]
        }
    };

    const RUNE_TYPES = {
        HEALTH: { id: 'health', name: '生命符文', icon: '❤️', color: '#ff6b6b' },
        STRENGTH: { id: 'strength', name: '力量符文', icon: '⚔️', color: '#ffa502' },
        DEFENSE: { id: 'defense', name: '防御符文', icon: '🛡️', color: '#70a1ff' },
        AGILITY: { id: 'agility', name: '敏捷符文', icon: '⚡', color: '#7bed9f' },
        LUCK: { id: 'luck', name: '幸运符文', icon: '🍀', color: '#eccc68' },
        MAGIC: { id: 'magic', name: '魔力符文', icon: '✨', color: '#a29bfe' }
    };

    const RUNE_LEVELS = {
        1: { name: '1级', buyPrice: 10, disassembleReturn: 5 },
        2: { name: '2级', buyPrice: null, disassembleReturn: 10 },
        3: { name: '3级', buyPrice: null, disassembleReturn: 20 },
        4: { name: '4级', buyPrice: null, disassembleReturn: 40 },
        5: { name: '5级', buyPrice: null, disassembleReturn: 80 }
    };

    // 成就定义（30+个成就）
    const ACHIEVEMENT_DEFS = {
        'first_enter': { id: 'first_enter', name: '初入王国', icon: '🏰', desc: '第一次进入游戏', category: '基础', check: (user) => true },
        'profile_complete': { id: 'profile_complete', name: '头号玩家', icon: '🎮', desc: '完善个人资料（头像、昵称、性别、签名）', category: '基础', check: (user) => user.profileCompleted },
        'level_10': { id: 'level_10', name: '初露锋芒', icon: '⭐', desc: '达到10级', category: '等级', check: (user) => user.level >= 10 },
        'level_30': { id: 'level_30', name: '渐入佳境', icon: '🌟', desc: '达到30级', category: '等级', check: (user) => user.level >= 30 },
        'level_50': { id: 'level_50', name: '登堂入室', icon: '💫', desc: '达到50级', category: '等级', check: (user) => user.level >= 50 },
        'level_80': { id: 'level_80', name: '炉火纯青', icon: '✨', desc: '达到80级', category: '等级', check: (user) => user.level >= 80 },
        'level_100': { id: 'level_100', name: '登峰造极', icon: '👑', desc: '达到100级', category: '等级', check: (user) => user.level >= 100 },
        'gold_1k': { id: 'gold_1k', name: '小富即安', icon: '💰', desc: '累计获得1000金币', category: '财富', check: (user) => (user.totalGoldEarned || 0) >= 1000 },
        'gold_10k': { id: 'gold_10k', name: '富甲一方', icon: '💰💰', desc: '累计获得10000金币', category: '财富', check: (user) => (user.totalGoldEarned || 0) >= 10000 },
        'gold_100k': { id: 'gold_100k', name: '富可敌国', icon: '💰💰💰', desc: '累计获得100000金币', category: '财富', check: (user) => (user.totalGoldEarned || 0) >= 100000 },
        'diamond_100': { id: 'diamond_100', name: '钻石王', icon: '💎', desc: '累计获得100钻石', category: '财富', check: (user) => (user.totalDiamondEarned || 0) >= 100 },
        'battle_1': { id: 'battle_1', name: '初战告捷', icon: '⚔️', desc: '赢得第一场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 1 },
        'battle_10': { id: 'battle_10', name: '百战不殆', icon: '⚔️', desc: '赢得10场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 10 },
        'battle_100': { id: 'battle_100', name: '百战百胜', icon: '⚔️', desc: '赢得100场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 100 },
        'battle_500': { id: 'battle_500', name: '战无不胜', icon: '⚔️', desc: '赢得500场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 500 },
        'crit_10': { id: 'crit_10', name: '暴击新手', icon: '💥', desc: '累计暴击10次', category: '战斗', check: (user) => (user.totalCrits || 0) >= 10 },
        'crit_100': { id: 'crit_100', name: '暴击大师', icon: '💥', desc: '累计暴击100次', category: '战斗', check: (user) => (user.totalCrits || 0) >= 100 },
        'dungeon_10': { id: 'dungeon_10', name: '探索者', icon: '🏰', desc: '通关10层地宫', category: '地宫', check: (user) => (user.clearedFloors || []).length >= 10 },
        'dungeon_50': { id: 'dungeon_50', name: '冒险家', icon: '🗺️', desc: '通关50层地宫', category: '地宫', check: (user) => (user.clearedFloors || []).length >= 50 },
        'dungeon_100': { id: 'dungeon_100', name: '地宫之王', icon: '👑', desc: '通关100层地宫', category: '地宫', check: (user) => (user.clearedFloors || []).length >= 100 },
        'boss_1': { id: 'boss_1', name: '屠龙勇士', icon: '🐉', desc: '击败第一个BOSS', category: 'BOSS', check: (user) => (user.defeatedMonsters || {}).bosses?.length >= 1 },
        'boss_5': { id: 'boss_5', name: 'BOSS杀手', icon: '👹', desc: '击败5个不同的BOSS', category: 'BOSS', check: (user) => (user.defeatedMonsters || {}).bosses?.length >= 5 },
        'boss_all': { id: 'boss_all', name: 'BOSS终结者', icon: '👑', desc: '击败所有BOSS', category: 'BOSS', check: (user) => {
            const bosses = (user.defeatedMonsters || {}).bosses || [];
            const allBossIds = Object.keys(BOSS_MONSTERS).map(Number);
            return allBossIds.every(id => bosses.includes(id));
        } },
        'equip_1': { id: 'equip_1', name: '装备收藏家', icon: '🎒', desc: '收集第一件装备', category: '收集', check: (user) => (user.collectedEquipment || []).length >= 1 },
        'equip_10': { id: 'equip_10', name: '装备大师', icon: '⚔️', desc: '收集10件不同的装备', category: '收集', check: (user) => (user.collectedEquipment || []).length >= 10 },
        'equip_all': { id: 'equip_all', name: '装备之王', icon: '👑', desc: '收集所有装备', category: '收集', check: (user) => {
            const collected = user.collectedEquipment || [];
            const allEquip = Object.keys(EQUIPMENT);
            return collected.length >= allEquip.length;
        } },
        'item_1': { id: 'item_1', name: '道具收藏家', icon: '📦', desc: '收集第一种道具', category: '收集', check: (user) => (user.collectedItems || []).length >= 1 },
        'item_all': { id: 'item_all', name: '道具大师', icon: '🎁', desc: '收集所有道具', category: '收集', check: (user) => {
            const collected = user.collectedItems || [];
            const allItems = Object.keys(ITEMS);
            return collected.length >= allItems.length;
        } },
        'monster_10': { id: 'monster_10', name: '怪物猎人', icon: '🐺', desc: '击败10种不同的怪物', category: '收集', check: (user) => {
            const monsters = (user.defeatedMonsters || {}).normals || [];
            const elites = (user.defeatedMonsters || {}).elites || [];
            return monsters.length + elites.length >= 10;
        } },
        'monster_all': { id: 'monster_all', name: '怪物图鉴全', icon: '📖', desc: '击败所有怪物', category: '收集', check: (user) => {
            const normalMonsters = Object.keys(MONSTERS).map(Number);
            const eliteMonsters = Object.keys(ELITE_MONSTERS).map(Number);
            const bossMonsters = Object.keys(BOSS_MONSTERS).map(Number);
            const defeatedNormal = (user.defeatedMonsters || {}).normals || [];
            const defeatedElite = (user.defeatedMonsters || {}).elites || [];
            const defeatedBoss = (user.defeatedMonsters || {}).bosses || [];
            const allDefeated = new Set([...defeatedNormal, ...defeatedElite, ...defeatedBoss]);
            const allMonsters = new Set([...normalMonsters, ...eliteMonsters, ...bossMonsters]);
            return allDefeated.size >= allMonsters.size;
        } },
        'pet_1': { id: 'pet_1', name: '驯宠新手', icon: '🐾', desc: '获得第一只宠物', category: '宠物', check: (user) => (user.pets || []).length >= 1 },
        'pet_5': { id: 'pet_5', name: '驯宠达人', icon: '🐕', desc: '获得5只宠物', category: '宠物', check: (user) => (user.pets || []).length >= 5 },
        'pet_legend': { id: 'pet_legend', name: '传说宠物', icon: '⭐', desc: '获得一只传说级宠物', category: '宠物', check: (user) => (user.pets || []).some(p => p.rarity === PET_RARITY.LEGENDARY) },
        'talent_1': { id: 'talent_1', name: '天赋觉醒', icon: '🌟', desc: '激活第一个天赋', category: '天赋', check: (user) => Object.values(user.talents || {}).some(lv => lv > 0) },
        'talent_all': { id: 'talent_all', name: '天赋大成', icon: '✨', desc: '所有天赋达到满级', category: '天赋', check: (user) => {
            const className = user.characterClass;
            const classTalents = TALENTS[className] || [];
            const userTalents = user.talents || {};
            return classTalents.every(talent => (userTalents[talent.id] || 0) >= talent.maxLevel);
        } },
        'rune_1': { id: 'rune_1', name: '符文入门', icon: '🔮', desc: '获得第一个符文', category: '符文', check: (user) => (user.runes || []).length >= 1 },
        'rune_6': { id: 'rune_6', name: '符文大师', icon: '✨', desc: '装备满6个符文', category: '符文', check: (user) => (user.activeRunes || []).filter(r => r).length >= 6 },
        'rune_5': { id: 'rune_5', name: '5级符文', icon: '💎', desc: '合成一个5级符文', category: '符文', check: (user) => (user.runes || []).some(r => r.level >= 5) },
        'endless_10': { id: 'endless_10', name: '无尽挑战者', icon: '∞', desc: '无尽模式达到10波', category: '挑战', check: (user) => (user.endlessWave || 1) >= 10 },
        'endless_50': { id: 'endless_50', name: '无尽王者', icon: '👑', desc: '无尽模式达到50波', category: '挑战', check: (user) => (user.endlessWave || 1) >= 50 },
        'first_tame': { id: 'first_tame', name: '驯兽师', icon: '🦊', desc: '成功驯服第一只宠物', category: '挑战', check: (user) => (user.hasTamed || false) },
        'evolution_1': { id: 'evolution_1', name: '超进化', icon: '👑', desc: '成功挑战一次进化BOSS', category: '挑战', check: (user) => {
            const evoCounts = user.bossEvolutionCounts || {};
            return Object.values(evoCounts).some(count => count > 0);
        } }
    };

    const RUNE_BONUS = {
        health: { base: 100, perLevel: 50 },
        strength: { base: 10, perLevel: 5 },
        defense: { base: 8, perLevel: 4 },
        agility: { base: 0.1, perLevel: 0.05 },
        luck: { base: 3, perLevel: 1.5 },
        magic: { base: 20, perLevel: 10 }
    };

    const TALENTS = {
        '狂战': [
            {
                id: 'warrior_bloodthirst',
                name: '嗜血',
                icon: '🩸',
                description: '每次攻击有概率回复生命值',
                effectType: 'lifesteal',
                baseValue: 3,
                perLevel: 2,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 3 + (level - 1) * 2;
                    return `攻击时有${value}%概率回复最大生命值的5%`;
                }
            },
            {
                id: 'warrior_berserker',
                name: '狂战士',
                icon: '💢',
                description: '生命值越低，攻击力越高',
                effectType: 'hp_bonus',
                baseValue: 2,
                perLevel: 1.5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 2 + (level - 1) * 1.5;
                    return `生命值低于50%时，攻击力提升${value}%`;
                }
            },
            {
                id: 'warrior_armor_pierce',
                name: '破甲',
                icon: '⚔️',
                description: '无视敌人部分防御力',
                effectType: 'armor_pierce',
                baseValue: 5,
                perLevel: 3,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 5 + (level - 1) * 3;
                    return `攻击时无视敌人${value}%防御力`;
                }
            }
        ],
        '游侠': [
            {
                id: 'ranger_critical',
                name: '致命一击',
                icon: '💥',
                description: '提升暴击率',
                effectType: 'crit_rate',
                baseValue: 5,
                perLevel: 3,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 5 + (level - 1) * 3;
                    return `暴击率提升${value}%`;
                }
            },
            {
                id: 'ranger_evasion',
                name: '闪避',
                icon: '👻',
                description: '提升闪避率',
                effectType: 'evasion',
                baseValue: 4,
                perLevel: 2.5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 4 + (level - 1) * 2.5;
                    return `闪避率提升${value}%`;
                }
            },
            {
                id: 'ranger_rapid_fire',
                name: '速射',
                icon: '🏹',
                description: '提升攻击速度',
                effectType: 'attack_speed',
                baseValue: 3,
                perLevel: 2,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 3 + (level - 1) * 2;
                    return `攻击速度提升${value}%`;
                }
            }
        ],
        '牧师': [
            {
                id: 'priest_healing',
                name: '神圣治愈',
                icon: '💚',
                description: '提升治疗效果',
                effectType: 'heal_bonus',
                baseValue: 10,
                perLevel: 5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 10 + (level - 1) * 5;
                    return `治疗效果提升${value}%`;
                }
            },
            {
                id: 'priest_barrier',
                name: '神圣护盾',
                icon: '🛡️',
                description: '受到伤害时有概率获得护盾',
                effectType: 'shield',
                baseValue: 8,
                perLevel: 4,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 8 + (level - 1) * 4;
                    return `受到伤害时有${value}%概率获得吸收10%最大生命的护盾`;
                }
            },
            {
                id: 'priest_purify',
                name: '净化',
                icon: '✨',
                description: '提升异常状态抗性',
                effectType: 'status_resist',
                baseValue: 10,
                perLevel: 5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 10 + (level - 1) * 5;
                    return `异常状态抗性提升${value}%`;
                }
            }
        ],
        '法师': [
            {
                id: 'mage_mana_efficiency',
                name: '魔力精通',
                icon: '🔮',
                description: '减少技能魔力消耗',
                effectType: 'mana_cost',
                baseValue: 5,
                perLevel: 3,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 5 + (level - 1) * 3;
                    return `技能魔力消耗降低${value}%`;
                }
            },
            {
                id: 'mage_elemental',
                name: '元素强化',
                icon: '🔥',
                description: '提升法术伤害',
                effectType: 'magic_damage',
                baseValue: 8,
                perLevel: 4,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 8 + (level - 1) * 4;
                    return `法术伤害提升${value}%`;
                }
            },
            {
                id: 'mage_arcane',
                name: '奥术智慧',
                icon: '💫',
                description: '提升最大魔力值',
                effectType: 'max_mana',
                baseValue: 10,
                perLevel: 5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 10 + (level - 1) * 5;
                    return `最大魔力值提升${value}%`;
                }
            }
        ],
        '盾骑': [
            {
                id: 'guardian_iron_wall',
                name: '铁壁',
                icon: '🧱',
                description: '提升防御力',
                effectType: 'defense',
                baseValue: 8,
                perLevel: 4,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 8 + (level - 1) * 4;
                    return `防御力提升${value}%`;
                }
            },
            {
                id: 'guardian_rebound',
                name: '反弹',
                icon: '💢',
                description: '受到攻击时反弹伤害',
                effectType: 'reflect',
                baseValue: 5,
                perLevel: 2.5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 5 + (level - 1) * 2.5;
                    return `受到攻击时反弹${value}%伤害`;
                }
            },
            {
                id: 'guardian_vitality',
                name: '活力',
                icon: '❤️',
                description: '提升最大生命值',
                effectType: 'max_hp',
                baseValue: 8,
                perLevel: 4,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 8 + (level - 1) * 4;
                    return `最大生命值提升${value}%`;
                }
            }
        ],
        '武僧': [
            {
                id: 'monk_ki',
                name: '气',
                icon: '☯️',
                description: '提升攻击和防御',
                effectType: 'dual_stat',
                baseValue: 4,
                perLevel: 2,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 4 + (level - 1) * 2;
                    return `攻击力和防御力各提升${value}%`;
                }
            },
            {
                id: 'monk_counter',
                name: '反击',
                icon: '⚡',
                description: '闪避后下次攻击必定暴击',
                effectType: 'counter_crit',
                baseValue: 30,
                perLevel: 10,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 30 + (level - 1) * 10;
                    return `闪避后${value}%概率下次攻击必定暴击`;
                }
            },
            {
                id: 'monk_meditation',
                name: '冥想',
                icon: '🧘',
                description: '战斗中缓慢恢复生命值',
                effectType: 'hp_regen',
                baseValue: 0.5,
                perLevel: 0.3,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = +(0.5 + (level - 1) * 0.3).toFixed(1);
                    return `每回合恢复${value}%最大生命值`;
                }
            }
        ],
        '平民': [
            {
                id: 'commoner_lucky',
                name: '幸运儿',
                icon: '🍀',
                description: '提升掉宝率',
                effectType: 'drop_rate',
                baseValue: 10,
                perLevel: 5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 10 + (level - 1) * 5;
                    return `掉宝率提升${value}%`;
                }
            },
            {
                id: 'commoner_economist',
                name: '理财',
                icon: '💰',
                description: '提升金币获取',
                effectType: 'gold_bonus',
                baseValue: 10,
                perLevel: 5,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 10 + (level - 1) * 5;
                    return `金币获取提升${value}%`;
                }
            },
            {
                id: 'commoner_adapt',
                name: '适应',
                icon: '🌿',
                description: '均衡提升所有属性',
                effectType: 'all_stats',
                baseValue: 2,
                perLevel: 1,
                maxLevel: 8,
                getEffect: (level) => {
                    const value = 2 + (level - 1) * 1;
                    return `所有属性提升${value}%`;
                }
            }
        ]
    };

    const SKILL_TYPE = {
        ATTACK: 'attack',
        DEFENSE: 'defense',
        BUFF: 'buff',
        DEBUFF: 'debuff',
        HEAL: 'heal',
        SPECIAL: 'special'
    };

    const SKILLS = {
        '狂战': [
            {
                id: 'warrior_frenzy_strike',
                name: '狂暴打击',
                description: '激发内心的狂暴之力，对敌人造成强力打击',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 150,
                baseEffect: 0,
                magicCost: 15,
                levelBonus: 10,
                maxLevel: 10
            },
            {
                id: 'warrior_whirlwind',
                name: '旋风斩',
                description: '以自身为中心旋转武器，攻击周围所有敌人',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 80,
                hits: 3,
                baseEffect: 0,
                magicCost: 20,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'warrior_armor_break',
                name: '破甲击',
                description: '精准攻击敌人护甲弱点，降低其防御力',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 100,
                baseEffect: 20,
                effectType: 'defense_down',
                magicCost: 18,
                levelBonus: 5,
                effectBonus: 3,
                maxLevel: 10
            },
            {
                id: 'warrior_battle_shout',
                name: '战吼',
                description: '发出激昂的战吼，提升自身攻击力',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 15,
                effectType: 'attack_up',
                magicCost: 12,
                levelBonus: 2,
                maxLevel: 10
            },
            {
                id: 'warrior_life_drain',
                name: '生命汲取',
                description: '攻击敌人并将部分伤害转化为自身生命',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 120,
                baseEffect: 30,
                effectType: 'lifesteal',
                magicCost: 25,
                levelBonus: 8,
                effectBonus: 5,
                maxLevel: 10
            }
        ],
        '游侠': [
            {
                id: 'ranger_precise_shot',
                name: '精准射击',
                description: '瞄准敌人弱点射出致命一箭',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 130,
                baseEffect: 0,
                magicCost: 12,
                levelBonus: 8,
                maxLevel: 10
            },
            {
                id: 'ranger_piercing_arrow',
                name: '穿透箭',
                description: '射出一支能够穿透敌人护甲的箭矢',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 110,
                baseEffect: 30,
                effectType: 'armor_penetration',
                magicCost: 18,
                levelBonus: 6,
                effectBonus: 5,
                maxLevel: 10
            },
            {
                id: 'ranger_multi_shot',
                name: '多重射击',
                description: '同时射出多支箭矢攻击多个目标',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 60,
                targets: 3,
                baseEffect: 0,
                magicCost: 22,
                levelBonus: 4,
                maxLevel: 10
            },
            {
                id: 'ranger_evasion',
                name: '闪避',
                description: '集中精神，大幅提升下一次闪避几率',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 50,
                effectType: 'evasion_up',
                magicCost: 10,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'ranger_eagle_eye',
                name: '鹰眼',
                description: '开启鹰眼，提升暴击几率',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 10,
                effectType: 'crit_rate_up',
                magicCost: 8,
                levelBonus: 2,
                maxLevel: 10
            }
        ],
        '法师': [
            {
                id: 'mage_frost_bolt',
                name: '冰霜箭',
                description: '凝聚寒冰之力射出冰霜箭矢',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 140,
                baseEffect: 0,
                magicCost: 15,
                levelBonus: 10,
                maxLevel: 10
            },
            {
                id: 'mage_blizzard',
                name: '暴风雪',
                description: '召唤暴风雪对范围内所有敌人造成伤害',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 100,
                baseEffect: 0,
                magicCost: 25,
                levelBonus: 6,
                maxLevel: 10
            },
            {
                id: 'mage_fire_burst',
                name: '火焰爆发',
                description: '释放强大的火焰能量造成爆炸伤害',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 200,
                baseEffect: 0,
                magicCost: 35,
                levelBonus: 15,
                maxLevel: 10
            },
            {
                id: 'mage_frost_armor',
                name: '冰霜护甲',
                description: '用冰霜之力包裹自身，提升防御力',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 20,
                effectType: 'defense_up',
                magicCost: 12,
                levelBonus: 3,
                maxLevel: 10
            },
            {
                id: 'mage_magic_shield',
                name: '魔力护盾',
                description: '用魔力构建护盾吸收伤害',
                type: SKILL_TYPE.DEFENSE,
                baseDamage: 100,
                baseEffect: 0.5,
                effectType: 'magic_shield',
                magicCost: 20,
                levelBonus: 10,
                maxLevel: 10
            }
        ],
        '牧师': [
            {
                id: 'priest_holy_wrath',
                name: '圣光惩戒',
                description: '用神圣之光惩戒邪恶敌人',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 120,
                baseEffect: 0,
                magicCost: 12,
                levelBonus: 8,
                maxLevel: 10
            },
            {
                id: 'priest_heal',
                name: '治愈术',
                description: '用神圣之力恢复生命',
                type: SKILL_TYPE.HEAL,
                baseDamage: 150,
                baseEffect: 0.8,
                effectType: 'heal',
                magicCost: 20,
                levelBonus: 10,
                maxLevel: 10
            },
            {
                id: 'priest_holy_shield',
                name: '神圣护盾',
                description: '召唤神圣护盾吸收伤害',
                type: SKILL_TYPE.DEFENSE,
                baseDamage: 80,
                baseEffect: 0.4,
                effectType: 'holy_shield',
                magicCost: 18,
                levelBonus: 8,
                maxLevel: 10
            },
            {
                id: 'priest_purify',
                name: '净化',
                description: '净化自身负面效果',
                type: SKILL_TYPE.SPECIAL,
                baseDamage: 0,
                baseEffect: 70,
                effectType: 'purify',
                magicCost: 10,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'priest_divine_blessing',
                name: '神圣祝福',
                description: '祝福全队提升攻击力',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 10,
                effectType: 'party_attack_up',
                magicCost: 25,
                levelBonus: 2,
                maxLevel: 10
            }
        ],
        '盾骑': [
            {
                id: 'guardian_shield_bash',
                name: '盾击',
                description: '用盾牌猛击敌人',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 100,
                baseEffect: 0,
                magicCost: 10,
                levelBonus: 6,
                maxLevel: 10
            },
            {
                id: 'guardian_taunt',
                name: '嘲讽',
                description: '嘲讽敌人强制其攻击自己',
                type: SKILL_TYPE.SPECIAL,
                baseDamage: 0,
                baseEffect: 2,
                effectType: 'taunt',
                magicCost: 15,
                levelBonus: 1,
                maxLevel: 10
            },
            {
                id: 'guardian_divine_guard',
                name: '神圣守护',
                description: '获得神圣庇护减少受到的伤害',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 25,
                effectType: 'damage_reduction',
                magicCost: 18,
                levelBonus: 3,
                maxLevel: 10
            },
            {
                id: 'guardian_counter',
                name: '反击',
                description: '准备反击，反弹部分受到的伤害',
                type: SKILL_TYPE.DEFENSE,
                baseDamage: 0,
                baseEffect: 30,
                effectType: 'reflect_damage',
                magicCost: 12,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'guardian_shield_break',
                name: '破盾',
                description: '攻击敌人并降低其防御力',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 80,
                baseEffect: 15,
                effectType: 'defense_down',
                magicCost: 16,
                levelBonus: 4,
                effectBonus: 4,
                maxLevel: 10
            }
        ],
        '武僧': [
            {
                id: 'monk_combo_kick',
                name: '连环腿',
                description: '快速连续踢出三脚',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 60,
                hits: 3,
                baseEffect: 0,
                magicCost: 15,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'monk_whirlwind_kick',
                name: '旋风腿',
                description: '旋转身体用腿攻击周围敌人',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 70,
                baseEffect: 0,
                magicCost: 20,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'monk_evasion_art',
                name: '闪避术',
                description: '运用身法提升闪避几率',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 30,
                effectType: 'evasion_up',
                magicCost: 12,
                levelBonus: 4,
                maxLevel: 10
            },
            {
                id: 'monk_golden_bell',
                name: '金钟罩',
                description: '运起内力形成护体金钟',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 20,
                effectType: 'damage_reduction',
                magicCost: 15,
                levelBonus: 3,
                maxLevel: 10
            },
            {
                id: 'monk_acupuncture',
                name: '点穴',
                description: '精准点穴降低敌人攻击速度',
                type: SKILL_TYPE.DEBUFF,
                baseDamage: 0,
                baseEffect: 20,
                effectType: 'atk_speed_down',
                magicCost: 18,
                levelBonus: 5,
                maxLevel: 10
            }
        ],
        '平民': [
            {
                id: 'commoner_lucky_strike',
                name: '幸运一击',
                description: '凭借运气打出暴击',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 110,
                baseEffect: 10,
                effectType: 'crit_rate_up',
                magicCost: 8,
                levelBonus: 5,
                effectBonus: 1,
                maxLevel: 10
            },
            {
                id: 'commoner_gold_attack',
                name: '金钱攻击',
                description: '投掷金币砸向敌人造成伤害',
                type: SKILL_TYPE.ATTACK,
                baseDamage: 0,
                baseEffect: 0.1,
                effectType: 'gold_damage',
                magicCost: 5,
                levelBonus: 0.01,
                maxLevel: 10
            },
            {
                id: 'commoner_escape',
                name: '逃跑',
                description: '尝试逃离战斗',
                type: SKILL_TYPE.SPECIAL,
                baseDamage: 0,
                baseEffect: 50,
                effectType: 'escape',
                magicCost: 5,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'commoner_scavenge',
                name: '搜刮',
                description: '战斗后额外获得金币',
                type: SKILL_TYPE.BUFF,
                baseDamage: 0,
                baseEffect: 20,
                effectType: 'gold_bonus',
                magicCost: 0,
                levelBonus: 5,
                maxLevel: 10
            },
            {
                id: 'commoner_summon_pet',
                name: '召唤宠物',
                description: '临时召唤宠物协助战斗',
                type: SKILL_TYPE.SPECIAL,
                baseDamage: 0,
                baseEffect: 1,
                effectType: 'summon_pet',
                magicCost: 30,
                levelBonus: 1,
                maxLevel: 10
            }
        ]
    };

    const SKILL_UPGRADE_COSTS = [
        0,      // 1级（初始）
        100,    // 1→2
        250,    // 2→3
        500,    // 3→4
        1000,   // 4→5
        2000,   // 5→6
        4000,   // 6→7
        10,     // 7→8（钻石）
        25,     // 8→9（钻石）
        50      // 9→10（钻石）
    ];

    function getUserSkills() {
        const userData = getCurrentUserData();
        if (!userData) return {};
        return userData.skills || {};
    }

    function getSkillLevel(skillId) {
        const skills = getUserSkills();
        return skills[skillId] || 1;
    }

    function setSkillLevel(skillId, level) {
        const userData = getCurrentUserData();
        if (!userData) return false;
        if (!userData.skills) {
            userData.skills = {};
        }
        userData.skills[skillId] = level;
        saveAccounts();
        return true;
    }

    function getSkillUpgradeCost(skillId) {
        const currentLevel = getSkillLevel(skillId);
        if (currentLevel >= 10) return null;
        
        const cost = SKILL_UPGRADE_COSTS[currentLevel];
        const isDiamondCost = currentLevel >= 7;
        
        return {
            amount: cost,
            type: isDiamondCost ? 'diamond' : 'gold'
        };
    }

    function upgradeSkill(skillId) {
        const userData = getCurrentUserData();
        if (!userData) return { success: false, message: '用户数据不存在' };
        
        const currentLevel = getSkillLevel(skillId);
        if (currentLevel >= 10) {
            return { success: false, message: '技能已达到最高等级' };
        }
        
        const cost = getSkillUpgradeCost(skillId);
        if (!cost) {
            return { success: false, message: '无法获取升级费用' };
        }
        
        if (cost.type === 'gold') {
            if (userData.gold < cost.amount) {
                return { success: false, message: `金币不足，需要${cost.amount}金币` };
            }
            userData.gold -= cost.amount;
        } else {
            if (!userData.diamond || userData.diamond < cost.amount) {
                return { success: false, message: `钻石不足，需要${cost.amount}钻石` };
            }
            userData.diamond -= cost.amount;
        }
        
        setSkillLevel(skillId, currentLevel + 1);
        saveAccounts();
        
        return { success: true, message: `技能升级到${currentLevel + 1}级！` };
    }

    function getPlayerSkills() {
        const userData = getCurrentUserData();
        if (!userData) return [];
        
        const classSkills = SKILLS[userData.characterClass];
        if (!classSkills) return [];
        
        return classSkills.map(skill => ({
            ...skill,
            currentLevel: getSkillLevel(skill.id)
        }));
    }

    function createPetFromMonster(monsterName, imgOverride) {
        const template = PET_TEMPLATES[monsterName];
        if (!template) {
            return {
                id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: monsterName,
                rarity: PET_RARITY.COMMON,
                hp: 50,
                maxHp: 50,
                atk: 8,
                level: 1,
                img: imgOverride || monsterName + '.png'
            };
        }
        return {
            id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: template.name,
            rarity: template.rarity,
            hp: template.baseHp,
            maxHp: template.baseHp,
            atk: template.baseAtk,
            level: 1,
            img: template.img
        };
    }

    function getUserPets() {
        const userData = getCurrentUserData();
        if (!userData) return [];
        if (!userData.pets) {
            userData.pets = [];
        }
        return userData.pets;
    }

    function addPetToInventory(pet) {
        const userData = getCurrentUserData();
        if (!userData) return false;
        if (!userData.pets) {
            userData.pets = [];
        }
        if (userData.pets.length >= 60) {
            return false;
        }
        userData.pets.push(pet);
        saveAccounts();
        return true;
    }

    function getActivePets() {
        const userData = getCurrentUserData();
        if (!userData) return [];
        return userData.activePets || [];
    }

    function setActivePets(petIds) {
        const userData = getCurrentUserData();
        if (!userData) return false;
        if (petIds.length > 3) {
            petIds = petIds.slice(0, 3);
        }
        userData.activePets = petIds;
        saveAccounts();
        return true;
    }

    function removePetFromInventory(petId) {
        const userData = getCurrentUserData();
        if (!userData || !userData.pets) return null;
        const index = userData.pets.findIndex(p => p.id === petId);
        if (index !== -1) {
            const pet = userData.pets.splice(index, 1)[0];
            saveAccounts();
            return pet;
        }
        return null;
    }

    function isPetInventoryFull() {
        const pets = getUserPets();
        return pets.length >= 60;
    }

    function getUserRunes() {
        const userData = getCurrentUserData();
        if (!userData) return [];
        if (!userData.runes) {
            userData.runes = [];
        }
        return userData.runes;
    }

    function addRuneToInventory(rune) {
        const userData = getCurrentUserData();
        if (!userData) return false;
        if (!userData.runes) {
            userData.runes = [];
        }
        if (userData.runes.length >= 100) {
            return false;
        }
        userData.runes.push(rune);
        saveAccounts();
        return true;
    }

    function getEquippedRunes() {
        const userData = getCurrentUserData();
        if (!userData) return [];
        return userData.equippedRunes || [];
    }

    function equipRune(runeId) {
        const userData = getCurrentUserData();
        if (!userData) return { success: false, message: '用户数据不存在' };

        const rune = userData.runes.find(r => r.id === runeId);
        if (!rune) return { success: false, message: '符文不存在' };
        if (rune.equipped) return { success: false, message: '符文已装备' };

        const equipped = userData.equippedRunes || [];
        const sameTypeEquipped = equipped.find(id => {
            const r = userData.runes.find(r => r.id === id);
            return r && r.type === rune.type;
        });
        if (sameTypeEquipped) return { success: false, message: '同类型符文已装备' };
        if (equipped.length >= 6) return { success: false, message: '已装备6个符文' };

        rune.equipped = true;
        if (!userData.equippedRunes) userData.equippedRunes = [];
        userData.equippedRunes.push(runeId);
        saveAccounts();
        return { success: true, message: '符文装备成功' };
    }

    function unequipRune(runeId) {
        const userData = getCurrentUserData();
        if (!userData) return { success: false, message: '用户数据不存在' };

        const rune = userData.runes.find(r => r.id === runeId);
        if (!rune) return { success: false, message: '符文不存在' };
        if (!rune.equipped) return { success: false, message: '符文未装备' };

        rune.equipped = false;
        userData.equippedRunes = (userData.equippedRunes || []).filter(id => id !== runeId);
        saveAccounts();
        return { success: true, message: '符文卸下成功' };
    }

    function removeRuneFromInventory(runeId) {
        const userData = getCurrentUserData();
        if (!userData) return null;

        const index = userData.runes.findIndex(r => r.id === runeId);
        if (index !== -1) {
            const rune = userData.runes.splice(index, 1)[0];
            userData.equippedRunes = (userData.equippedRunes || []).filter(id => id !== runeId);
            saveAccounts();
            return rune;
        }
        return null;
    }

    function createRandomRune() {
        const types = Object.values(RUNE_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        return {
            id: 'rune_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: randomType.id,
            level: 1,
            equipped: false
        };
    }

    function getRuneBonus(type, level) {
        const bonus = RUNE_BONUS[type];
        if (!bonus) return 0;
        return bonus.base + (level - 1) * bonus.perLevel;
    }

    function getTotalRuneBonus() {
        const equipped = getEquippedRunes();
        const runes = getUserRunes();
        const bonus = { hp: 0, attack: 0, defense: 0, atkSpeed: 0, critRate: 0, magic: 0 };

        equipped.forEach(runeId => {
            const rune = runes.find(r => r.id === runeId);
            if (rune) {
                const value = getRuneBonus(rune.type, rune.level);
                switch (rune.type) {
                    case 'health': bonus.hp += value; break;
                    case 'strength': bonus.attack += value; break;
                    case 'defense': bonus.defense += value; break;
                    case 'agility': bonus.atkSpeed += value; break;
                    case 'luck': bonus.critRate += value; break;
                    case 'magic': bonus.magic += value; break;
                }
            }
        });

        return bonus;
    }

    function isRuneInventoryFull() {
        return getUserRunes().length >= 100;
    }

    function openRuneShop() {
        const runeShopModal = document.getElementById('runeShopModal');
        if (!runeShopModal) return;
        
        renderRuneShop();
        runeShopModal.classList.add('active');

        const closeBtn = runeShopModal.querySelector('.rune-shop-close');
        const backdrop = runeShopModal.querySelector('.rune-shop-backdrop');
        
        const closeShop = () => {
            runeShopModal.classList.remove('active');
            closeBtn?.removeEventListener('click', closeShop);
            backdrop?.removeEventListener('click', closeShop);
        };
        
        closeBtn?.addEventListener('click', closeShop);
        backdrop?.addEventListener('click', closeShop);
    }

    let selectedEquipment = null;
    let pendingPurchase = null;

    function openShop() {
        const shopModal = document.getElementById('shopModal');
        if (!shopModal) return;
        
        renderShopItems('all');
        updateShopCurrency();
        shopModal.style.display = 'flex';

        const closeBtn = shopModal.querySelector('.shop-close');
        const backdrop = shopModal.querySelector('.shop-backdrop');
        
        const closeShop = () => {
            shopModal.style.display = 'none';
            closeBtn?.removeEventListener('click', closeShop);
            backdrop?.removeEventListener('click', closeShop);
        };
        
        closeBtn?.addEventListener('click', closeShop);
        backdrop?.addEventListener('click', closeShop);

        const tabs = shopModal.querySelectorAll('.shop-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderShopItems(tab.dataset.tab);
            });
        });
    }

    function updateShopCurrency() {
        const userData = getCurrentUserData();
        if (!userData) return;
        
        const goldSpan = document.querySelector('.currency-gold');
        const diamondSpan = document.querySelector('.currency-diamond');
        const evoSpan = document.getElementById('shopEvoCoin');
        
        if (goldSpan) goldSpan.textContent = `💰 ${userData.gold || 0}`;
        if (diamondSpan) diamondSpan.textContent = `💎 ${userData.diamond || 0}`;
        if (evoSpan) evoSpan.textContent = (userData.items && userData.items.evolutionCoin) || 0;
    }

    function renderShopItems(tab) {
        const shopItems = document.getElementById('shopItems');
        if (!shopItems) return;

        const userData = getCurrentUserData();
        const userClass = userData?.characterClass || '狂战';
        
        let html = '';
        
        if (tab === 'item') {
            // 显示道具
            const filteredItems = Object.values(ITEMS);
            filteredItems.forEach(item => {
                const isSoldOut = item.price === null;
                const currency = item.currency || 'gold';
                const price = item.price;
                
                html += `
                    <div class="shop-item-card ${isSoldOut ? 'sold-out' : ''}" data-item-name="${item.name}">
                        <div class="shop-item-icon">${item.icon}</div>
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-desc">${item.desc}</div>
                        ${isSoldOut ? 
                            '<div class="shop-item-soldout-text">非卖品</div>' : 
                            `<div class="shop-item-price ${currency === 'diamond' ? 'diamond-price' : ''}">${currency === 'diamond' ? '💎' : '💰'} ${price}</div>`
                        }
                    </div>
                `;
            });
            
            shopItems.innerHTML = html;
            
            // 添加购买事件
            const cards = shopItems.querySelectorAll('.shop-item-card:not(.sold-out)');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const itemName = card.dataset.itemName;
                    const item = ITEMS[itemName];
                    if (item && item.price !== null) {
                        handleBuyItem(item);
                    }
                });
            });
        } else {
            // 显示装备
            let filteredEquipment = Object.values(EQUIPMENT);
            
            switch(tab) {
                case 'class':
                    filteredEquipment = filteredEquipment.filter(e => e.class === userClass);
                    break;
                case 'traveler':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.BLUE && e.name.startsWith('旅人'));
                    break;
                case 'ocean':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.ORANGE && e.name.startsWith('洋流'));
                    break;
                case 'angel':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.ORANGE && e.name.startsWith('天使'));
                    break;
                case 'emperor':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.ORANGE && e.name.startsWith('帝'));
                    break;
                case 'dark':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.RED && e.name.startsWith('暗黑'));
                    break;
                case 'dragon':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.RED && e.name.startsWith('龙神'));
                    break;
                case 'creator':
                    filteredEquipment = filteredEquipment.filter(e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.RED && e.name.startsWith('创世'));
                    break;
            }

            filteredEquipment.forEach(equip => {
                const isSoldOut = equip.price === null;
                const currency = equip.currency || 'gold';
                const price = equip.price;
                
                const getEquipImage = (name) => {
                    const specialImages = {
                        '天使光剑': '天使光剑 .png',
                        '天使护甲': '天使护甲 .png',
                        '天使之裙': '天使之裙 .png'
                    };
                    if (specialImages[name]) {
                        return `../image/equipment/${specialImages[name]}`;
                    }
                    return `../image/equipment/${name}.png`;
                };
                
                html += `
                    <div class="shop-item-card rarity-${equip.rarity} ${isSoldOut ? 'sold-out' : ''}" data-equipment-name="${equip.name}">
                        <img src="${getEquipImage(equip.name)}" alt="${equip.name}" class="shop-item-img" onerror="this.src='../image/equipment/新手铁剑.png'">
                        <div class="shop-item-name">${equip.name}</div>
                        ${isSoldOut ?
                            '<div class="shop-item-soldout-text">非卖品</div>' :
                            `<div class="shop-item-price ${currency === 'evoCoin' ? 'evo-coin' : (currency === 'diamond' ? 'diamond-price' : '')}">${currency === 'evoCoin' ? '🪙' : (currency === 'diamond' ? '💎' : '💰')} ${price}</div>`
                        }
                    </div>
                `;
            });

            shopItems.innerHTML = html;

            const cards = shopItems.querySelectorAll('.shop-item-card:not(.sold-out)');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const equipName = card.dataset.equipmentName;
                    const equip = EQUIPMENT[equipName];
                    if (equip && equip.price !== null) {
                        handleBuyEquipment(equip);
                    }
                });
            });
        }
    }

    function showPurchaseConfirm(type, data) {
        const purchaseConfirmModal = document.getElementById('purchaseConfirmModal');
        const purchaseConfirmText = document.getElementById('purchaseConfirmText');
        const purchaseConfirmPrice = document.getElementById('purchaseConfirmPrice');

        if (!purchaseConfirmModal || !purchaseConfirmText || !purchaseConfirmPrice) return;

        const currency = data.currency || 'gold';
        const price = data.price;
        const currencyIcon = currency === 'evoCoin' ? '🪙' : (currency === 'diamond' ? '💎' : '💰');

        purchaseConfirmText.textContent = `确定购买 ${data.name} 吗？`;
        purchaseConfirmPrice.textContent = `价格: ${currencyIcon} ${price}`;

        pendingPurchase = { type, data };

        purchaseConfirmModal.classList.add('active');
        purchaseConfirmModal.style.display = 'flex';
    }

    function handleBuyItem(item) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const currency = item.currency || 'gold';
        const price = item.price;

        if (currency === 'gold' && userData.gold < price) {
            showMessage('金币不足！');
            return;
        }

        if (currency === 'diamond' && userData.diamond < price) {
            showMessage('钻石不足！');
            return;
        }

        showPurchaseConfirm('item', item);
    }

    function executeBuyItem(item) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const currency = item.currency || 'gold';
        const price = item.price;

        if (currency === 'gold') {
            userData.gold -= price;
        } else if (currency === 'diamond') {
            userData.diamond -= price;
        }

        if (!userData.backpackItems) userData.backpackItems = [];

        const existingItem = userData.backpackItems.find(bi => bi.name === item.name);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            let slotIndex = 0;
            for (let i = 0; i < 60; i++) {
                const hasSlot = userData.backpackItems.some(bi => bi.slot === i);
                if (!hasSlot) {
                    slotIndex = i;
                    break;
                }
            }
            userData.backpackItems.push({
                id: 'item_' + Date.now(),
                name: item.name,
                icon: item.icon,
                type: 'consumable',
                itemType: item.type,
                effect: item.effect,
                slot: slotIndex,
                quantity: 1
            });
        }

        collectItem(item.name);
        saveAccounts();
        updateShopCurrency();
        showMessage(`购买成功！获得了${item.name}！`);
    }

    function handleBuyEquipment(equip) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const currency = equip.currency || 'gold';
        const price = equip.price;

        if (currency === 'gold' && userData.gold < price) {
            showMessage('金币不足！');
            return;
        }

        if (currency === 'evoCoin') {
            const evoCoin = userData.items && userData.items.evolutionCoin || 0;
            if (evoCoin < price) {
                showMessage('进化币不足！');
                return;
            }
        }

        showPurchaseConfirm('equipment', equip);
    }

    function executeBuyEquipment(equip) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const currency = equip.currency || 'gold';
        const price = equip.price;

        if (currency === 'evoCoin') {
            const evoCoin = userData.items && userData.items.evolutionCoin || 0;
            if (!userData.items) userData.items = {};
            userData.items.evolutionCoin = evoCoin - price;
        }

        if (currency === 'gold') {
            userData.gold -= price;
        }

        if (!userData.backpackItems) userData.backpackItems = [];

        let slotIndex = 0;
        for (let i = 0; i < 60; i++) {
            const hasSlot = userData.backpackItems.some(bi => bi.slot === i);
            if (!hasSlot) {
                slotIndex = i;
                break;
            }
        }

        const newEquip = {
            id: 'equip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: equip.name,
            icon: null,
            type: 'equipment',
            rarity: equip.rarity,
            equipType: equip.type,
            level: 0,
            props: { ...equip.props },
            growth: { ...equip.growth },
            slot: slotIndex,
            quantity: 1
        };

        userData.backpackItems.push(newEquip);

        collectEquipment(equip.name);
        saveAccounts();
        updateShopCurrency();
        showMessage(`购买成功！获得了${equip.name}！`);
    }

    function openEquipmentDetail(equip) {
        const modal = document.getElementById('equipmentDetailModal');
        if (!modal) return;

        selectedEquipment = equip;

        document.getElementById('equipmentDetailName').textContent = equip.name;
        document.getElementById('equipmentDetailImg').src = `../image/equipment/${equip.name}.png`;
        document.getElementById('equipmentDetailImg').onerror = function() {
            this.src = '../image/equipment/新手铁剑.png';
        };
        
        const rarityClass = `rarity-${equip.rarity}`;
        const rarityNames = { blue: '蓝色品质', purple: '紫色品质', orange: '橙色品质', red: '红色品质' };
        document.getElementById('equipmentDetailRarity').textContent = rarityNames[equip.rarity] || '未知品质';
        document.getElementById('equipmentDetailRarity').className = `equipment-detail-rarity ${rarityClass}`;

        const typeNames = { weapon: '武器', head: '头部', chest: '胸部', legs: '腿部', boots: '靴子', accessory: '饰品' };
        document.getElementById('equipmentDetailType').textContent = typeNames[equip.type] || '未知类型';
        document.getElementById('equipmentDetailLevel').textContent = `+${equip.level || 0}`;

        const equipData = EQUIPMENT[equip.name];
        let propsHtml = '';
        if (equipData) {
            const totalProps = calculateEquipmentStats(equipData, equip.level || 0);
            Object.entries(totalProps).forEach(([key, value]) => {
                const propNames = {
                    attack: '攻击力',
                    defense: '防御力',
                    maxHp: '最大生命',
                    speed: '速度',
                    magic: '魔力',
                    magicRegen: '魔力恢复',
                    criticalRate: '暴击率',
                    dodgeRate: '闪避率',
                    goldBonus: '金币加成'
                };
                const displayValue = key.includes('Rate') || key.includes('Bonus') ? (value * 100).toFixed(1) + '%' : value;
                propsHtml += `<div>${propNames[key] || key}: ${displayValue}</div>`;
            });
        }
        document.getElementById('equipmentDetailProps').innerHTML = propsHtml;

        modal.style.display = 'flex';

        const closeBtn = modal.querySelector('.equipment-detail-close');
        const backdrop = modal.querySelector('.equipment-detail-backdrop');
        
        const closeModal = () => {
            modal.style.display = 'none';
            selectedEquipment = null;
            closeBtn?.removeEventListener('click', closeModal);
            backdrop?.removeEventListener('click', closeModal);
        };
        
        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        document.getElementById('equipBtn')?.addEventListener('click', () => {
            equipEquipment(equip);
            closeModal();
        });

        document.getElementById('enhanceBtn')?.addEventListener('click', () => {
            enhanceEquipment(equip);
            closeModal();
        });

        document.getElementById('dismantleBtn')?.addEventListener('click', () => {
            dismantleEquipment(equip);
            closeModal();
        });
    }

    function showBackpackEquipmentDetail(item) {
        const modal = document.getElementById('equipmentDetailModal');
        if (!modal) return;

        const userData = getCurrentUserData();
        if (!userData) return;

        const isEquipped = userData.equipped && userData.equipped[item.equipType] && userData.equipped[item.equipType].id === item.id;
        const equip = item;

        document.getElementById('equipmentDetailName').textContent = equip.name;
        document.getElementById('equipmentDetailImg').src = `../image/equipment/${equip.name}.png`;
        document.getElementById('equipmentDetailImg').onerror = function() {
            this.src = '../image/equipment/新手铁剑.png';
        };

        const rarityClass = `rarity-${equip.rarity}`;
        const rarityNames = { blue: '蓝色品质', purple: '紫色品质', orange: '橙色品质', red: '红色品质' };
        document.getElementById('equipmentDetailRarity').textContent = rarityNames[equip.rarity] || '未知品质';
        document.getElementById('equipmentDetailRarity').className = `equipment-detail-rarity ${rarityClass}`;

        const typeNames = { weapon: '武器', head: '头部', chest: '胸部', legs: '腿部', boots: '靴子', accessory: '饰品' };
        document.getElementById('equipmentDetailType').textContent = typeNames[equip.equipType || equip.type] || '未知类型';
        document.getElementById('equipmentDetailLevel').textContent = `+${equip.level || 0}`;

        const equipData = EQUIPMENT[equip.name];
        let propsHtml = '';
        if (equipData) {
            const totalProps = calculateEquipmentStats(equipData, equip.level || 0);
            Object.entries(totalProps).forEach(([key, value]) => {
                const propNames = {
                    attack: '攻击力',
                    defense: '防御力',
                    maxHp: '最大生命',
                    speed: '速度',
                    magic: '魔力',
                    magicRegen: '魔力恢复',
                    criticalRate: '暴击率',
                    dodgeRate: '闪避率',
                    goldBonus: '金币加成'
                };
                const displayValue = key.includes('Rate') || key.includes('Bonus') ? (value * 100).toFixed(1) + '%' : value;
                propsHtml += `<div>${propNames[key] || key}: ${displayValue}</div>`;
            });
        }
        document.getElementById('equipmentDetailProps').innerHTML = propsHtml;

        modal.style.display = 'flex';

        const closeBtn = modal.querySelector('.equipment-detail-close');
        const backdrop = modal.querySelector('.equipment-detail-backdrop');

        const closeModal = () => {
            modal.style.display = 'none';
            selectedEquipment = null;
            closeBtn?.removeEventListener('click', closeModal);
            backdrop?.removeEventListener('click', closeModal);
        };

        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        const equipBtn = document.getElementById('equipBtn');
        if (isEquipped) {
            equipBtn.textContent = '卸下';
            equipBtn.onclick = () => {
                unequipEquipment(equip);
                closeModal();
                renderBackpackItems();
            };
        } else {
            equipBtn.textContent = '装备';
            equipBtn.onclick = () => {
                equipEquipment(equip);
                closeModal();
                renderBackpackItems();
            };
        }

        document.getElementById('enhanceBtn').onclick = () => {
            enhanceEquipment(equip);
            closeModal();
            renderBackpackItems();
        };

        document.getElementById('dismantleBtn').onclick = () => {
            dismantleEquipment(equip);
            closeModal();
            renderBackpackItems();
        };
    }

    function calculateEquipmentStats(equipData, level) {
        const stats = { ...equipData.props };
        if (equipData.growth && level > 0) {
            Object.entries(equipData.growth).forEach(([key, value]) => {
                stats[key] = (stats[key] || 0) + value * level;
            });
        }
        return stats;
    }

    function getEquipmentBonus(userData) {
        const bonus = { maxHp: 0, attack: 0, defense: 0, atkSpeed: 0, moveSpeed: 0, critRate: 0, magic: 0 };
        if (!userData || !userData.equipped) return bonus;

        Object.values(userData.equipped).forEach(equip => {
            const equipData = EQUIPMENT[equip.name];
            if (!equipData) return;
            const stats = calculateEquipmentStats(equipData, equip.level || 0);
            Object.entries(stats).forEach(([key, value]) => {
                if (key in bonus) {
                    bonus[key] += value;
                } else if (key === 'speed') {
                    bonus.atkSpeed += value * 0.01;
                } else if (key === 'criticalRate') {
                    bonus.critRate += value * 100;
                } else if (key === 'dodgeRate') {
                    // dodgeRate is a separate stat, skip for now
                } else if (key === 'goldBonus') {
                    // skip, not a combat stat
                }
            });
        });

        return bonus;
    }

    function getTalentBonus(userData) {
        const bonus = { maxHp: 0, attack: 0, defense: 0, atkSpeed: 0, critRate: 0, magic: 0 };
        if (!userData || !userData.talents) return bonus;

        const className = userData.characterClass || '平民';
        const classTalents = TALENTS[className];
        if (!classTalents) return bonus;

        const userTalents = userData.talents;

        classTalents.forEach(talent => {
            const level = userTalents[talent.id] || 0;
            if (level <= 0) return;

            const value = talent.baseValue + (level - 1) * talent.perLevel;

            switch (talent.effectType) {
                case 'defense':
                    bonus.defense += value;
                    break;
                case 'max_hp':
                    bonus.maxHp += value;
                    break;
                case 'crit_rate':
                    bonus.critRate += value;
                    break;
                case 'attack_speed':
                    bonus.atkSpeed += value;
                    break;
                case 'dual_stat':
                    bonus.attack += value;
                    bonus.defense += value;
                    break;
                case 'max_mana':
                    bonus.magic += value;
                    break;
                case 'all_stats':
                    bonus.maxHp += value;
                    bonus.attack += value;
                    bonus.defense += value;
                    bonus.atkSpeed += value;
                    bonus.critRate += value;
                    bonus.magic += value;
                    break;
            }
        });

        return bonus;
    }

    function equipEquipment(equip) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.equipped) userData.equipped = {};

        const prevEquip = userData.equipped[equip.equipType];

        if (prevEquip) {
            if (!userData.backpackItems) userData.backpackItems = [];
            userData.backpackItems.push(prevEquip);
        }

        userData.equipped[equip.equipType] = equip;

        if (userData.backpackItems) {
            const equipIndex = userData.backpackItems.findIndex(e => e.id === equip.id);
            if (equipIndex !== -1) {
                userData.backpackItems.splice(equipIndex, 1);
            }
        }

        saveAccounts();
        showMessage(`装备了${equip.name}！`);
        refreshVillageUI();
    }

    function unequipEquipment(equip) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.equipped || !userData.equipped[equip.equipType]) return;

        const equippedType = equip.equipType;
        delete userData.equipped[equippedType];

        if (!userData.backpackItems) userData.backpackItems = [];
        userData.backpackItems.push(equip);

        saveAccounts();
        showMessage(`卸下了${equip.name}！`);
        refreshVillageUI();
    }

    function enhanceEquipment(equip) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const currentLevel = equip.level || 0;
        if (currentLevel >= 60) {
            showMessage('已达最高强化等级！');
            return;
        }

        const cost = calculateEnhanceCost(currentLevel);
        const currency = currentLevel >= 40 ? 'diamond' : 'gold';

        if (currency === 'gold' && userData.gold < cost) {
            showMessage('金币不足！');
            return;
        }

        if (currency === 'diamond' && userData.diamond < cost) {
            showMessage('钻石不足！');
            return;
        }

        if (currency === 'gold') {
            userData.gold -= cost;
        } else {
            userData.diamond -= cost;
        }

        equip.level = currentLevel + 1;

        saveAccounts();
        showMessage(`${equip.name}强化到+${equip.level}！`);
        refreshVillageUI();
    }

    function calculateEnhanceCost(level) {
        const baseCost = 100;
        if (level < 40) {
            return Math.floor(baseCost * Math.pow(1.15, level));
        } else {
            return Math.floor(baseCost * Math.pow(1.2, level - 40));
        }
    }

    function dismantleEquipment(equip) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const equipData = EQUIPMENT[equip.name];
        if (!equipData) {
            showMessage('无法分解此装备！');
            return;
        }

        let totalReturn;
        let currency = 'gold';

        if (equipData.price === null) {
            if (equipData.rarity === 'red') {
                totalReturn = 500;
            } else {
                totalReturn = 50;
            }
        } else {
            currency = equipData.currency || 'gold';
            const basePrice = equipData.price;
            const levelBonus = (equip.level || 0) * 50;
            totalReturn = Math.floor((basePrice + levelBonus) * 0.5);
        }

        if (currency === 'gold') {
            userData.gold = (userData.gold || 0) + totalReturn;
        } else if (currency === 'evoCoin') {
            if (!userData.items) userData.items = {};
            userData.items.evolutionCoin = (userData.items.evolutionCoin || 0) + totalReturn;
        }

        if (userData.backpackItems) {
            const equipIndex = userData.backpackItems.findIndex(e => e.id === equip.id);
            if (equipIndex !== -1) {
                userData.backpackItems.splice(equipIndex, 1);
            }
        }

        const equippedIndex = Object.values(userData.equipped || {}).findIndex(e => e.id === equip.id);
        if (equippedIndex !== -1) {
            const type = Object.keys(userData.equipped).find(k => userData.equipped[k].id === equip.id);
            if (type) delete userData.equipped[type];
        }

        saveAccounts();
        showMessage(`分解成功！获得${currency === 'evoCoin' ? '🪙' : '💰'}${totalReturn}`);
        refreshVillageUI();
    }

    function renderRuneShop() {
        const runeShopGrid = document.getElementById('runeShopGrid');
        if (!runeShopGrid) return;

        let html = '';
        Object.values(RUNE_TYPES).forEach(runeType => {
            html += `
                <div class="rune-shop-item" data-rune-type="${runeType.id}">
                    <span class="rune-shop-item-icon">${runeType.icon}</span>
                    <span class="rune-shop-item-name">${runeType.name}</span>
                    <span class="rune-shop-item-price">💎 10</span>
                </div>
            `;
        });

        runeShopGrid.innerHTML = html;

        const items = runeShopGrid.querySelectorAll('.rune-shop-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const runeType = item.dataset.runeType;
                buySpecificRune(runeType);
            });
        });
    }

    function buySpecificRune(runeTypeId) {
        const userData = getCurrentUserData();
        if (!userData) {
            showMessage('用户数据不存在');
            return { success: false, message: '用户数据不存在' };
        }

        const buyPrice = 10;
        if (!userData.diamond || userData.diamond < buyPrice) {
            showMessage('钻石不足！需要10钻石');
            return { success: false, message: '钻石不足' };
        }

        if (isRuneInventoryFull()) {
            showMessage('符文背包已满！');
            return { success: false, message: '符文背包已满' };
        }

        userData.diamond -= buyPrice;

        const rune = {
            id: 'rune_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: runeTypeId,
            level: 1,
            equipped: false
        };

        const added = addRuneToInventory(rune);
        if (!added) {
            userData.diamond += buyPrice;
            showMessage('符文背包已满！');
            return { success: false, message: '符文背包已满' };
        }

        saveAccounts();
        const runeType = RUNE_TYPES[runeTypeId.toUpperCase()];
        showMessage(`获得了${runeType.name}！`);

        renderRuneInventory();
        refreshVillageUI();

        const runeShopModal = document.getElementById('runeShopModal');
        runeShopModal?.classList.remove('active');

        return { success: true, message: '购买成功' };
    }

    function openRuneSidebar() {
        const runeSidebar = document.getElementById('runeSidebar');
        if (!runeSidebar) return;

        selectedRunes = [];
        renderRuneInventory();
        renderEquippedRunes();
        updateRuneActionButtons();
        runeSidebar.classList.add('open');

        const closeBtn = runeSidebar.querySelector('.rune-close');
        const backdrop = runeSidebar.querySelector('.rune-backdrop');
        closeBtn?.addEventListener('click', closeRuneSidebar);
        backdrop?.addEventListener('click', closeRuneSidebar);

        const buyBtn = document.getElementById('runeBuyBtn');
        buyBtn?.addEventListener('click', openRuneShop);

        const composeBtn = document.getElementById('runeComposeBtn');
        composeBtn?.addEventListener('click', () => {
            composeRunes();
        });

        const disassembleBtn = document.getElementById('runeDisassembleBtn');
        disassembleBtn?.addEventListener('click', () => {
            disassembleRunes();
        });
    }

    function closeRuneSidebar() {
        const runeSidebar = document.getElementById('runeSidebar');
        if (runeSidebar) {
            runeSidebar.classList.remove('open');
        }
        selectedRunes = [];
    }

    function calculateTalentPoints(level) {
        if (level < 1) return 0;
        const points = 1 + Math.floor((level - 1) / 5);
        return Math.min(points, 24);
    }

    function getUserTalents() {
        const userData = getCurrentUserData();
        if (!userData) return {};
        if (!userData.talents) {
            userData.talents = {};
        }
        return userData.talents;
    }

    function getUsedTalentPoints() {
        const talents = getUserTalents();
        let total = 0;
        Object.values(talents).forEach(level => {
            total += level;
        });
        return total;
    }

    function getAvailableTalentPoints() {
        const userData = getCurrentUserData();
        if (!userData) return 0;
        const totalPoints = calculateTalentPoints(userData.level);
        const usedPoints = getUsedTalentPoints();
        return totalPoints - usedPoints;
    }

    function upgradeTalent(talentId) {
        const userData = getCurrentUserData();
        if (!userData) {
            showMessage('用户数据不存在');
            return { success: false, message: '用户数据不存在' };
        }

        const className = userData.characterClass;
        const talents = TALENTS[className];
        if (!talents) {
            showMessage('该职业没有天赋');
            return { success: false, message: '该职业没有天赋' };
        }

        const talent = talents.find(t => t.id === talentId);
        if (!talent) {
            showMessage('天赋不存在');
            return { success: false, message: '天赋不存在' };
        }

        const currentLevel = getUserTalents()[talentId] || 0;
        if (currentLevel >= talent.maxLevel) {
            showMessage('天赋已达满级');
            return { success: false, message: '天赋已达满级' };
        }

        const availablePoints = getAvailableTalentPoints();
        if (availablePoints <= 0) {
            showMessage('天赋点不足');
            return { success: false, message: '天赋点不足' };
        }

        if (!userData.talents) {
            userData.talents = {};
        }
        userData.talents[talentId] = currentLevel + 1;
        saveAccounts();

        showMessage(`${talent.name}升级到${currentLevel + 1}级！`);
        renderTalents();
        updateTalentResetButtons();

        return { success: true, message: '升级成功' };
    }

    function resetTalentsWithDiamond() {
        const userData = getCurrentUserData();
        if (!userData) {
            showMessage('用户数据不存在');
            return { success: false, message: '用户数据不存在' };
        }

        if (!userData.diamond || userData.diamond < 5) {
            showMessage('钻石不足！需要5钻石');
            return { success: false, message: '钻石不足' };
        }

        userData.diamond -= 5;
        userData.talents = {};
        saveAccounts();

        showMessage('天赋已重置，消耗5钻石');
        renderTalents();
        updateTalentResetButtons();

        return { success: true, message: '重置成功' };
    }

    function resetTalentsWithGold() {
        const userData = getCurrentUserData();
        if (!userData) {
            showMessage('用户数据不存在');
            return { success: false, message: '用户数据不存在' };
        }

        if (!userData.gold || userData.gold < 5000) {
            showMessage('金币不足！需要5000金币');
            return { success: false, message: '金币不足' };
        }

        userData.gold -= 5000;
        userData.talents = {};
        saveAccounts();

        showMessage('天赋已重置，消耗5000金币');
        renderTalents();
        updateTalentResetButtons();
        refreshVillageUI();

        return { success: true, message: '重置成功' };
    }

    function openTalentPanel() {
        const talentModal = document.getElementById('talentModal');
        if (!talentModal) return;

        renderTalents();
        updateTalentResetButtons();
        talentModal.classList.add('open');

        const closeBtn = talentModal.querySelector('.talent-close');
        const backdrop = talentModal.querySelector('.talent-backdrop');

        const closePanel = () => {
            talentModal.classList.remove('open');
            closeBtn?.removeEventListener('click', closePanel);
            backdrop?.removeEventListener('click', closePanel);
        };

        closeBtn?.addEventListener('click', closePanel);
        backdrop?.addEventListener('click', closePanel);
    }

    function renderTalents() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const className = userData.characterClass;
        const talents = TALENTS[className];
        if (!talents) return;

        const talentsSection = document.getElementById('talentsSection');
        const pointsValue = document.getElementById('talentPointsValue');

        if (!talentsSection || !pointsValue) return;

        const userTalents = getUserTalents();
        const availablePoints = getAvailableTalentPoints();

        pointsValue.textContent = availablePoints;

        let html = '';
        talents.forEach(talent => {
            const currentLevel = userTalents[talent.id] || 0;
            const isMaxLevel = currentLevel >= talent.maxLevel;
            const canUpgrade = availablePoints > 0 && !isMaxLevel;

            html += `
                <div class="talent-card">
                    <div class="talent-header-row">
                        <div class="talent-name">
                            <span class="talent-icon">${talent.icon}</span>
                            ${talent.name}
                        </div>
                        <span class="talent-level">Lv.${currentLevel}/${talent.maxLevel}</span>
                    </div>
                    <div class="talent-description">${talent.description}</div>
                    <div class="talent-current-effect">${currentLevel > 0 ? talent.getEffect(currentLevel) : '未激活'}</div>
                    ${!isMaxLevel ? `<div class="talent-next-effect">下一级效果: ${talent.getEffect(currentLevel + 1)}</div>` : ''}
                    <div class="talent-upgrade">
                        ${isMaxLevel ? '<div class="talent-max-level">已达满级</div>' : `<button class="talent-upgrade-btn ${canUpgrade ? '' : 'disabled'}" data-talent-id="${talent.id}">升级 (消耗1点)</button>`}
                    </div>
                </div>
            `;
        });

        talentsSection.innerHTML = html;

        const upgradeBtns = talentsSection.querySelectorAll('.talent-upgrade-btn:not(.disabled)');
        upgradeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const talentId = btn.dataset.talentId;
                upgradeTalent(talentId);
            });
        });
    }

    function updateTalentResetButtons() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const diamondBtn = document.getElementById('talentResetDiamond');
        const goldBtn = document.getElementById('talentResetGold');
        const hasTalents = Object.keys(getUserTalents()).length > 0;

        if (diamondBtn) {
            const canAffordDiamond = userData.diamond >= 5;
            diamondBtn.classList.toggle('disabled', !canAffordDiamond || !hasTalents);
        }

        if (goldBtn) {
            const canAffordGold = userData.gold >= 5000;
            goldBtn.classList.toggle('disabled', !canAffordGold || !hasTalents);
        }
    }

    // 挑战系统相关变量
    let currentChallengeMode = null;
    let endlessWave = 1;
    let bossEvolutionCounts = {};
    let selectedBossIdForPreview = null;

    function openChallengePanel() {
        const challengeModal = document.getElementById('challengeModal');
        if (!challengeModal) return;

        const userData = getCurrentUserData();
        if (userData) {
            endlessWave = userData.endlessWave || 1;
            bossEvolutionCounts = userData.bossEvolutionCounts || {};
            document.getElementById('endlessWave').textContent = endlessWave;
            
            const evoCoinSpan = document.getElementById('evoCoinCount');
            if (evoCoinSpan) {
                evoCoinSpan.textContent = (userData.items && userData.items.evolutionCoin) || 0;
            }
            
            const clearedFloors = userData.clearedFloors || [];
            const hasClearedBoss = clearedFloors.some(f => f % 10 === 0 && f <= 100);
            const modeBossEvo = document.getElementById('modeBossEvo');
            if (modeBossEvo) {
                if (hasClearedBoss) {
                    modeBossEvo.classList.remove('disabled');
                } else {
                    modeBossEvo.classList.add('disabled');
                }
            }
        }

        challengeModal.classList.add('open');
        document.getElementById('challengeModes').style.display = 'flex';
        document.getElementById('bossSelection').style.display = 'none';
        closeBossPreview();

        const closeBtn = challengeModal.querySelector('.challenge-close');
        const backdrop = challengeModal.querySelector('.challenge-backdrop');

        const closePanel = () => {
            challengeModal.classList.remove('open');
            closeBtn?.removeEventListener('click', closePanel);
            backdrop?.removeEventListener('click', closePanel);
        };

        closeBtn?.addEventListener('click', closePanel);
        backdrop?.addEventListener('click', closePanel);
    }

    function showBossPreview() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const clearedFloors = userData.clearedFloors || [];
        const bossIcons = ['🐰', '🐺', '⛄', '🐗', '🕷️', '👻', '🤖', '🧛', '🐉', '👑'];
        const bossIds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

        let html = '';
        bossIds.forEach((bossId, index) => {
            const boss = BOSS_MONSTERS[bossId];
            if (!boss) return;

            const isCleared = clearedFloors.includes(bossId);
            const evoCount = bossEvolutionCounts[bossId] || 0;

            html += `
                <div class="boss-preview-item ${isCleared ? 'unlocked' : 'disabled locked'}" data-boss-id="${bossId}">
                    <div class="boss-preview-item-icon">${bossIcons[index] || '👑'}</div>
                    <div class="boss-preview-item-name">${boss.name}</div>
                    <div class="boss-preview-item-floor">第${bossId}层</div>
                    ${isCleared ? `<div class="boss-preview-item-evo">进化: ${evoCount}</div>` : ''}
                </div>
            `;
        });

        const bossPreviewList = document.getElementById('bossPreviewList');
        if (bossPreviewList) {
            bossPreviewList.innerHTML = html;
        } else {
            console.error('bossPreviewList element not found');
        }

        const previewModal = document.getElementById('bossPreviewModal');
        if (previewModal) {
            previewModal.style.display = 'flex';
            
            const closeBtn = previewModal.querySelector('.boss-preview-close');
            const backdrop = previewModal.querySelector('.boss-preview-backdrop');
            
            const closePreview = () => {
                previewModal.style.display = 'none';
                closeBtn?.removeEventListener('click', closePreview);
                backdrop?.removeEventListener('click', closePreview);
            };

            closeBtn?.addEventListener('click', closePreview);
            backdrop?.addEventListener('click', closePreview);

            const bossItems = previewModal.querySelectorAll('.boss-preview-item.unlocked');
            bossItems.forEach(item => {
                item.addEventListener('click', () => {
                    const bossId = parseInt(item.dataset.bossId);
                    previewModal.style.display = 'none';
                    startBossEvolution(bossId);
                });
            });
        } else {
            console.error('bossPreviewModal element not found');
        }
    }

    function closeBossPreview() {
        const previewModal = document.getElementById('bossPreviewModal');
        if (previewModal) {
            previewModal.style.display = 'none';
        }
        selectedBossIdForPreview = null;
    }

    function startPvPChallenge() {
        const userData = getCurrentUserData();
        if (!userData) {
            showMessage('用户数据不存在');
            return;
        }

        const playerLevel = userData.level;
        const minLevel = Math.max(1, playerLevel - 1);
        const maxLevel = playerLevel + 5;
        const aiLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

        const classes = ['狂战', '游侠', '牧师', '法师', '盾骑', '武僧'];
        const aiClass = classes[Math.floor(Math.random() * classes.length)];

        const aiPlayer = generateAIPlayer(aiClass, aiLevel);

        closeChallengePanel();
        startPvPBattle(aiPlayer);
    }

    function startPvPBattle(aiPlayer) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const monsterData = {
            name: aiPlayer.name,
            img: `../image/main/${aiPlayer.characterClass}头像.png`,
            hp: aiPlayer.maxHp,
            maxHp: aiPlayer.maxHp,
            attack: aiPlayer.attack,
            defense: aiPlayer.defense,
            atkSpeed: aiPlayer.atkSpeed || 1.0,
            magic: aiPlayer.magic,
            isBoss: false,
            isElite: false,
            level: aiPlayer.level,
            characterClass: aiPlayer.characterClass,
            isAI: true
        };

        startBattle(0, {
            monster: monsterData,
            mode: 'pvp'
        });
    }

    function generateAIPlayer(charClass, level) {
        const stats = getCharacterStats(charClass, level);
        return {
            id: 'ai_' + Date.now(),
            name: getAIName(),
            characterClass: charClass,
            level: level,
            maxHp: stats.maxHp,
            currentHp: stats.maxHp,
            attack: stats.attack,
            defense: stats.defense,
            atkSpeed: stats.atkSpeed,
            magic: stats.magic
        };
    }

    function getAIName() {
        const prefixes = ['神秘', '暗影', '风暴', '冰霜', '火焰', '雷霆', '暗夜', '圣光'];
        const suffixes = ['战士', '游侠', '法师', '守护者', '行者', '猎手', '术士', '圣骑士'];
        return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
    }

    function startEndlessChallenge() {
        currentChallengeMode = 'endless';
        closeChallengePanel();
        startEndlessBattle();
    }

    function startEndlessBattle() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const wave = endlessWave;
        const monster = generateEndlessMonster(wave);

        closeChallengePanel();
        startBattle(wave, {
            monster: monster,
            mode: 'endless',
            wave: wave
        });
    }

    function generateEndlessMonster(wave) {
        const zoneMonsters = {
            1: { normal: [1, 2, 3, 4], elite: [5, 8] },
            2: { normal: [11, 12, 13, 14], elite: [15, 18] },
            3: { normal: [21, 22, 23, 24], elite: [25, 28] },
            4: { normal: [31, 32, 33, 34], elite: [35, 38] },
            5: { normal: [41, 42, 43, 44], elite: [45, 48] },
            6: { normal: [51, 52, 53, 54], elite: [55, 58] },
            7: { normal: [61, 62, 63, 64], elite: [65, 68] },
            8: { normal: [71, 72, 73, 74], elite: [75, 78] },
            9: { normal: [81, 82, 83, 84], elite: [85, 88] },
            10: { normal: [91, 92, 93, 94], elite: [95, 98] }
        };

        let maxZone;
        if (wave <= 5) maxZone = 1;
        else if (wave <= 10) maxZone = 2;
        else if (wave <= 20) maxZone = 4;
        else if (wave <= 30) maxZone = 6;
        else if (wave <= 50) maxZone = 8;
        else maxZone = 10;

        const isElite = wave > 5 && Math.random() < Math.min(0.2 + wave * 0.015, 0.6);

        let monsterPool = [];
        if (isElite) {
            for (let z = 1; z <= maxZone; z++) {
                monsterPool = monsterPool.concat(zoneMonsters[z].elite);
            }
        } else {
            for (let z = 1; z <= maxZone; z++) {
                monsterPool = monsterPool.concat(zoneMonsters[z].normal);
            }
        }

        const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
        const baseMonster = MONSTERS[monsterId] || ELITE_MONSTERS[monsterId];

        if (!baseMonster) {
            return MONSTERS[1];
        }

        const multiplier = 1 + (wave - 1) * 0.12;
        const adjustedMonster = {
            ...baseMonster,
            hp: Math.floor(baseMonster.hp * multiplier),
            attack: Math.floor(baseMonster.attack * multiplier),
            defense: Math.floor(baseMonster.defense * multiplier),
            isElite: isElite,
            wave: wave
        };

        return adjustedMonster;
    }

    function handleEndlessVictory() {
        const userData = getCurrentUserData();
        if (!userData) return;

        endlessWave++;
        if (endlessWave > 999) {
            endlessWave = 1;
        }

        userData.endlessWave = endlessWave;
        saveAccounts();
        refreshVillageUI();

        showMessage(`🎉 第${endlessWave - 1}波完成！进入第${endlessWave}波！`);

        setTimeout(() => {
            startEndlessBattle();
        }, 1500);
    }

    function handleEndlessDefeat() {
        showMessage(`💀 无尽模式失败！最终波数: ${endlessWave}`);
        endlessWave = 1;

        const userData = getCurrentUserData();
        if (userData) {
            userData.endlessWave = 1;
            saveAccounts();
        }
    }

    function openBossSelection() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const clearedFloors = userData.clearedFloors || [];
        const bossGrid = document.getElementById('bossGrid');
        const modesPanel = document.getElementById('challengeModes');
        const bossSelection = document.getElementById('bossSelection');

        if (!bossGrid || !modesPanel || !bossSelection) return;

        let html = '';
        const bossIds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const bossIcons = ['🐰', '🐺', '⛄', '🐗', '🕷️', '👻', '🤖', '🧛', '🐉', '👑'];

        bossIds.forEach((bossId, index) => {
            const isCleared = clearedFloors.includes(bossId);
            const evoCount = bossEvolutionCounts[bossId] || 0;
            const boss = BOSS_MONSTERS[bossId] || MONSTERS[bossId];

            if (boss) {
                html += `
                    <div class="boss-card ${isCleared ? '' : 'disabled'}" data-boss-id="${bossId}">
                        <div class="boss-icon">${bossIcons[index]}</div>
                        <div class="boss-name">${boss.name}</div>
                        <div class="boss-level">BOSS</div>
                        ${isCleared ? `<div class="boss-evo-count">进化次数: ${evoCount}</div>` : '<div class="boss-evo-count">未通关</div>'}
                    </div>
                `;
            }
        });

        bossGrid.innerHTML = html;

        modesPanel.style.display = 'none';
        bossSelection.style.display = 'block';

        const bossCards = bossGrid.querySelectorAll('.boss-card:not(.disabled)');
        bossCards.forEach(card => {
            card.addEventListener('click', () => {
                const bossId = parseInt(card.dataset.bossId);
                showBossPreview(bossId);
            });
        });

        const backBtn = bossSelection.querySelector('.boss-selection-back');
        backBtn?.addEventListener('click', () => {
            modesPanel.style.display = 'flex';
            bossSelection.style.display = 'none';
        });
    }

    function startBossEvolution(bossId) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const boss = BOSS_MONSTERS[bossId] || MONSTERS[bossId];
        if (!boss) return;

        const evoCount = bossEvolutionCounts[bossId] || 0;
        const multiplier = Math.pow(2, evoCount);

        const evolvedBoss = {
            ...boss,
            hp: Math.floor(boss.hp * multiplier),
            attack: Math.floor(boss.attack * multiplier),
            defense: Math.floor(boss.defense * multiplier),
            isBoss: true,
            evoCount: evoCount,
            originalId: bossId
        };

        currentChallengeMode = 'bossEvolution';
        closeChallengePanel();
        startBattle(bossId, {
            monster: evolvedBoss,
            mode: 'bossEvolution',
            bossId: bossId,
            evoCount: evoCount
        });
    }

    function handleBossEvolutionVictory(bossId, evoCount) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.bossEvolutionCounts) {
            userData.bossEvolutionCounts = {};
        }
        userData.bossEvolutionCounts[bossId] = evoCount + 1;

        const evolutionCoins = 1 + evoCount;
        addEvolutionCoins(evolutionCoins);
        addBattleLog(`🪙 获得${evolutionCoins}进化币！`);

        userData.diamond = (userData.diamond || 0) + 10;

        saveAccounts();
        refreshVillageUI();

        showMessage(`🎉 BOSS超进化胜利！获得${evolutionCoins}进化币和10钻石！`);
    }

    function addEvolutionCoins(count) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.items) {
            userData.items = {};
        }
        if (!userData.items.evolutionCoin) {
            userData.items.evolutionCoin = 0;
        }
        userData.items.evolutionCoin += count;
    }

    function closeChallengePanel() {
        const challengeModal = document.getElementById('challengeModal');
        if (challengeModal) {
            challengeModal.classList.remove('open');
        }
    }

    function renderRuneInventory() {
        const grid = document.getElementById('runeInventoryGrid');
        if (!grid) return;

        const runes = getUserRunes();
        let html = '';

        for (let i = 0; i < 100; i++) {
            if (i < runes.length) {
                const rune = runes[i];
                const runeType = RUNE_TYPES[rune.type.toUpperCase()];
                const levelClass = getRuneLevelClass(rune.level);
                const isSelected = selectedRunes.includes(rune.id);
                const selectedClass = isSelected ? 'selected' : '';
                const equippedClass = rune.equipped ? 'equipped' : '';

                html += `<div class="rune-card ${levelClass} ${selectedClass} ${equippedClass}" data-rune-id="${rune.id}">
                    <span class="rune-icon">${runeType.icon}</span>
                    <span class="rune-level">Lv.${rune.level}</span>
                    ${!rune.equipped ? '<button class="equip-btn">装备</button>' : '<span class="equipped-text">已装备</span>'}
                </div>`;
            } else {
                html += `<div class="rune-card empty"></div>`;
            }
        }

        grid.innerHTML = html;

        const runeCards = grid.querySelectorAll('.rune-card:not(.empty)');
        runeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('equip-btn')) {
                    const result = equipRune(card.dataset.runeId);
                    if (result.success) {
                        showMessage(result.message);
                        renderEquippedRunes();
                        renderRuneInventory();
                        refreshVillageUI();
                    } else {
                        showMessage(result.message);
                    }
                } else {
                    toggleRuneSelection(card.dataset.runeId);
                }
            });
        });
    }

    function getRuneLevelClass(level) {
        switch (level) {
            case 1: return 'level-1';
            case 2: return 'level-2';
            case 3: return 'level-3';
            case 4: return 'level-4';
            case 5: return 'level-5';
            default: return 'level-1';
        }
    }

    function toggleRuneSelection(runeId) {
        const index = selectedRunes.indexOf(runeId);
        if (index === -1) {
            selectedRunes.push(runeId);
        } else {
            selectedRunes.splice(index, 1);
        }
        renderRuneInventory();
        updateRuneActionButtons();
    }

    function renderEquippedRunes() {
        const grid = document.getElementById('runeEquippedGrid');
        if (!grid) return;

        const equipped = getEquippedRunes();
        const runes = getUserRunes();
        const slots = grid.querySelectorAll('.rune-slot');

        slots.forEach((slot, index) => {
            if (equipped[index]) {
                const rune = runes.find(r => r.id === equipped[index]);
                if (rune) {
                    const runeType = RUNE_TYPES[rune.type.toUpperCase()];
                    slot.innerHTML = `<span class="rune-icon">${runeType.icon}</span><span class="rune-level">Lv.${rune.level}</span>`;
                    slot.classList.add('has-rune');
                    slot.dataset.runeId = rune.id;
                    slot.onclick = () => {
                        const result = unequipRune(rune.id);
                        if (result.success) {
                            showMessage(result.message);
                            renderEquippedRunes();
                            renderRuneInventory();
                            refreshVillageUI();
                        } else {
                            showMessage(result.message);
                        }
                    };
                }
            } else {
                slot.innerHTML = '';
                slot.classList.remove('has-rune');
                delete slot.dataset.runeId;
                slot.onclick = null;
            }
        });
    }

    function updateRuneActionButtons() {
        const composeBtn = document.getElementById('runeComposeBtn');
        const disassembleBtn = document.getElementById('runeDisassembleBtn');

        if (selectedRunes.length === 3) {
            const runes = getUserRunes();
            const selectedRuneObjs = selectedRunes.map(id => runes.find(r => r.id === id)).filter(r => r);
            const allSameLevel = selectedRuneObjs.every(r => r.level === selectedRuneObjs[0].level);
            const canCompose = allSameLevel && selectedRuneObjs[0].level < 5;
            composeBtn.disabled = !canCompose;
        } else {
            composeBtn.disabled = true;
        }

        disassembleBtn.disabled = selectedRunes.length === 0;
    }

    function composeRunes() {
        if (selectedRunes.length !== 3) {
            showMessage('请选中3个符文进行合成');
            return { success: false, message: '需要3个符文' };
        }

        const runes = getUserRunes();
        const selectedRuneObjs = selectedRunes.map(id => runes.find(r => r.id === id)).filter(r => r);

        if (selectedRuneObjs.length !== 3) {
            showMessage('符文数据错误');
            return { success: false, message: '符文数据错误' };
        }

        const firstLevel = selectedRuneObjs[0].level;
        const allSameLevel = selectedRuneObjs.every(r => r.level === firstLevel);

        if (!allSameLevel) {
            showMessage('请选择同等级的符文');
            return { success: false, message: '符文等级不同' };
        }

        if (firstLevel >= 5) {
            showMessage('5级符文无法继续合成');
            return { success: false, message: '已满级' };
        }

        const newType = selectedRuneObjs[Math.floor(Math.random() * 3)].type;

        selectedRunes.forEach(id => {
            removeRuneFromInventory(id);
        });

        const newRune = {
            id: 'rune_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: newType,
            level: firstLevel + 1,
            equipped: false
        };

        addRuneToInventory(newRune);
        saveAccounts();

        const runeType = RUNE_TYPES[newType.toUpperCase()];
        showMessage(`合成成功！获得了${runeType.name}！`);

        selectedRunes = [];
        renderRuneInventory();
        renderEquippedRunes();
        updateRuneActionButtons();

        return { success: true, message: '合成成功' };
    }

    function disassembleRunes() {
        if (selectedRunes.length === 0) {
            showMessage('请选择要分解的符文');
            return { success: false, message: '没有选中符文' };
        }

        const runes = getUserRunes();
        let totalReturn = 0;
        let disassembled = [];

        selectedRunes.forEach(runeId => {
            const rune = runes.find(r => r.id === runeId);
            if (rune) {
                const returnAmount = RUNE_LEVELS[rune.level].disassembleReturn;
                totalReturn += returnAmount;
                disassembled.push(rune.id);
            }
        });

        if (totalReturn === 0) {
            showMessage('分解失败');
            return { success: false, message: '分解失败' };
        }

        disassembled.forEach(id => {
            removeRuneFromInventory(id);
        });

        const userData = getCurrentUserData();
        userData.diamond = (userData.diamond || 0) + totalReturn;
        saveAccounts();

        showMessage(`分解成功！返还${totalReturn}钻石`);

        selectedRunes = [];
        renderRuneInventory();
        renderEquippedRunes();
        updateRuneActionButtons();
        refreshVillageUI();

        return { success: true, message: `分解成功，返还${totalReturn}钻石` };
    }

    function showMessage(msg) {
        if (msgDiv) {
            msgDiv.textContent = msg;
        }
    }

    function getMonsterMultiplier(floor) {
        const zone = Math.floor((floor - 1) / 10);
        return Math.pow(1.35, zone);
    }

    function getMonsterData(floor) {
        if (BOSS_MONSTERS[floor]) {
            const boss = BOSS_MONSTERS[floor];
            const multiplier = getMonsterMultiplier(floor);
            return {
                name: boss.name,
                img: boss.img,
                hp: Math.floor(boss.hp * multiplier),
                attack: Math.floor(boss.attack * multiplier),
                defense: Math.floor(boss.defense * multiplier),
                atkSpeed: boss.atkSpeed,
                moveSpeed: boss.moveSpeed,
                isBoss: true
            };
        }
        if (ELITE_MONSTERS[floor]) {
            const elite = ELITE_MONSTERS[floor];
            const multiplier = getMonsterMultiplier(floor);
            return {
                name: elite.name,
                img: elite.img,
                hp: Math.floor(elite.hp * multiplier),
                attack: Math.floor(elite.attack * multiplier),
                defense: Math.floor(elite.defense * multiplier),
                atkSpeed: elite.atkSpeed,
                moveSpeed: elite.moveSpeed,
                isElite: true
            };
        }
        const base = MONSTERS[floor] || MONSTERS[((floor - 1) % 4) + 1];
        const multiplier = getMonsterMultiplier(floor);
        return {
            name: base.name,
            img: base.img,
            hp: Math.floor(base.hp * multiplier),
            attack: Math.floor(base.attack * multiplier),
            defense: Math.floor(base.defense * multiplier),
            atkSpeed: base.atkSpeed,
            moveSpeed: base.moveSpeed,
            isBoss: false,
            isElite: false
        };
    }

    function getAttributeMultiplier(level) {
        if (level <= 30) return 1.2;
        if (level <= 60) return 1.0;
        if (level <= 90) return 0.8;
        return 0.6;
    }

    function getGrowthConfig(className) {
        const growthMap = {
            '狂战': WARRIOR_GROWTH,
            '游侠': RANGER_GROWTH,
            '牧师': PRIEST_GROWTH,
            '法师': MAGE_GROWTH,
            '盾骑': GUARDIAN_GROWTH,
            '武僧': MONK_GROWTH,
            '平民': COMMONER_GROWTH
        };
        return growthMap[className] || WARRIOR_GROWTH;
    }

    function getGrowthPhase(level) {
        if (level <= 30) return 'phase1';
        if (level <= 60) return 'phase2';
        if (level <= 90) return 'phase3';
        return 'phase4';
    }

    function calculateBaseStats(className, level) {
        const baseStats = { ...CLASS_BASE_STATS[className] };
        const growth = getGrowthConfig(className);
        const phase = getGrowthPhase(level);
        const phaseConfig = growth[phase];
        const multiplier = getAttributeMultiplier(level);

        const calculateMinorStat = (stat) => {
            return phaseConfig.minor[stat] || 0.2;
        };

        if (className === '武僧') {
            baseStats.agility += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            baseStats.perception += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            baseStats.strength += Math.floor(0.4 * level * multiplier * phaseConfig.major.strength);
            baseStats.constitution += Math.floor(0.4 * level * multiplier * phaseConfig.major.constitution);
            baseStats.magic += Math.floor(0.4 * level * multiplier * phaseConfig.major.magic);
            baseStats.intelligence += Math.floor(calculateMinorStat('intelligence') * level * multiplier);
            baseStats.luck += Math.floor(calculateMinorStat('luck') * level * multiplier);
        } else if (className === '游侠') {
            baseStats.agility += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            baseStats.perception += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
            baseStats.luck += Math.floor(0.4 * level * multiplier * phaseConfig.major);
            baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
            baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
            baseStats.intelligence += Math.floor(calculateMinorStat('intelligence') * level * multiplier);
            baseStats.magic += Math.floor(calculateMinorStat('magic') * level * multiplier);
        } else if (className === '牧师') {
            baseStats.perception += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            baseStats.intelligence += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
            baseStats.magic += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 0.9);
            baseStats.luck += Math.floor(0.4 * level * multiplier * phaseConfig.major);
            baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
            baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
            baseStats.agility += Math.floor(calculateMinorStat('agility') * level * multiplier);
        } else if (className === '法师') {
            baseStats.intelligence += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            baseStats.perception += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
            baseStats.magic += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 0.8);
            baseStats.luck += Math.floor(0.4 * level * multiplier * phaseConfig.major);
            baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
            baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
            baseStats.agility += Math.floor(calculateMinorStat('agility') * level * multiplier);
        } else if (className === '盾骑') {
            baseStats.constitution += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            baseStats.strength += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
            baseStats.agility += Math.floor(0.4 * level * multiplier * phaseConfig.major);
            baseStats.perception += Math.floor(calculateMinorStat('perception') * level * multiplier);
            baseStats.intelligence += Math.floor(calculateMinorStat('intelligence') * level * multiplier);
            baseStats.luck += Math.floor(calculateMinorStat('luck') * level * multiplier);
            baseStats.magic += Math.floor(calculateMinorStat('magic') * level * multiplier);
        } else if (className === '平民') {
            baseStats.luck += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
            baseStats.perception += Math.floor((0.4 * level * multiplier * phaseConfig.major.perception) * 1.1);
            baseStats.intelligence += Math.floor((0.4 * level * multiplier * phaseConfig.major.intelligence) * 1.1);
            baseStats.magic += Math.floor((0.4 * level * multiplier * phaseConfig.major.magic) * 1.1);
            baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
            baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
            baseStats.agility += Math.floor(calculateMinorStat('agility') * level * multiplier);
        } else {
            growth.coreStats.forEach(stat => {
                baseStats[stat] += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            });
            growth.majorStats.forEach(stat => {
                if (typeof phaseConfig.major === 'object') {
                    baseStats[stat] += Math.floor(0.4 * level * multiplier * phaseConfig.major[stat]);
                } else {
                    baseStats[stat] += Math.floor(0.4 * level * multiplier * phaseConfig.major);
                }
            });
            growth.minorStats.forEach(stat => {
                baseStats[stat] += Math.floor(calculateMinorStat(stat) * level * multiplier);
            });
        }

        return baseStats;
    }

    function calculateBattleStats(className, level, baseStats) {
        const stats = {};

        stats.maxHp = Math.floor(100 + baseStats.constitution * CLASS_COEFFICIENTS[className].hpCoefficient * level);

        const attackStat = CLASS_COEFFICIENTS[className].attackCoefficient.stat;
        if (attackStat === 'average') {
            stats.attack = Math.floor(15 + (baseStats.strength + baseStats.agility + baseStats.perception + baseStats.intelligence) / 4 * CLASS_COEFFICIENTS[className].attackCoefficient.value);
        } else {
            stats.attack = Math.floor(15 + baseStats[attackStat] * CLASS_COEFFICIENTS[className].attackCoefficient.value);
        }

        stats.defense = Math.floor(8 + baseStats.constitution * CLASS_COEFFICIENTS[className].defenseCoefficient);

        stats.atkSpeed = +(1 + (baseStats.agility / 12) * 0.06).toFixed(2);

        stats.moveSpeed = +(3 + (baseStats.agility / 12) * 0.12).toFixed(2);

        if (className === '武僧') {
            stats.atkSpeed = +(stats.atkSpeed + baseStats.agility * 0.02).toFixed(2);
        }

        stats.critRate = +(baseStats.luck * 0.35).toFixed(2);

        if (className === '平民') {
            stats.critRate = +(stats.critRate + baseStats.luck * 0.25).toFixed(2);
        }

        stats.rareDropRate = +(baseStats.luck * 0.6).toFixed(2);

        return stats;
    }

    function getCharacterStats(className, level, userDataParam) {
        const userData = userDataParam || getCurrentUserData();
        const baseStats = calculateBaseStats(className, level);
        const battleStats = calculateBattleStats(className, level, baseStats);
        const stats = { ...baseStats, ...battleStats };

        if (userData) {
            const equipBonus = getEquipmentBonus(userData);
            stats.maxHp += equipBonus.maxHp;
            stats.attack += equipBonus.attack;
            stats.defense += equipBonus.defense;
            stats.atkSpeed = +(stats.atkSpeed + equipBonus.atkSpeed).toFixed(2);
            stats.critRate = +(stats.critRate + equipBonus.critRate).toFixed(2);
            stats.magic = (stats.magic || 0) + equipBonus.magic;

            const runeBonus = getTotalRuneBonus();
            stats.maxHp += runeBonus.hp;
            stats.attack += runeBonus.attack;
            stats.defense += runeBonus.defense;
            stats.atkSpeed = +(stats.atkSpeed + runeBonus.atkSpeed).toFixed(2);
            stats.critRate = +(stats.critRate + runeBonus.critRate).toFixed(2);
            stats.magic += runeBonus.magic;

            const talentBonus = getTalentBonus(userData);
            if (talentBonus.maxHp > 0) stats.maxHp = Math.floor(stats.maxHp * (1 + talentBonus.maxHp / 100));
            if (talentBonus.attack > 0) stats.attack = Math.floor(stats.attack * (1 + talentBonus.attack / 100));
            if (talentBonus.defense > 0) stats.defense = Math.floor(stats.defense * (1 + talentBonus.defense / 100));
            if (talentBonus.atkSpeed > 0) stats.atkSpeed = +(stats.atkSpeed * (1 + talentBonus.atkSpeed / 100)).toFixed(2);
            if (talentBonus.critRate > 0) stats.critRate = +(stats.critRate + talentBonus.critRate).toFixed(2);
            if (talentBonus.magic > 0) stats.magic = Math.floor(stats.magic * (1 + talentBonus.magic / 100));

            stats.equipBonus = equipBonus;
            stats.runeBonus = runeBonus;
            stats.talentBonus = talentBonus;
        }

        return stats;
    }

    function getCoefficientForLevel(level) {
        if (level >= 1 && level <= 40) {
            return EXP_CURVE_CONFIG.phaseMultipliers['1-40'];
        } else if (level >= 41 && level <= 80) {
            return EXP_CURVE_CONFIG.phaseMultipliers['41-80'];
        } else if (level >= 81 && level <= 120) {
            return EXP_CURVE_CONFIG.phaseMultipliers['81-120'];
        }
        return EXP_CURVE_CONFIG.phaseMultipliers['81-120'];
    }

    function getExpForLevel(level) {
        if (level <= 1) {
            return EXP_CURVE_CONFIG.baseExp;
        }
        const coefficient = getCoefficientForLevel(level);
        return Math.round(EXP_CURVE_CONFIG.baseExp * Math.pow(coefficient, level - 1));
    }

    function getTotalExpForLevel(targetLevel) {
        if (targetLevel <= 1) {
            return 0;
        }
        let totalExp = 0;
        for (let level = 1; level < targetLevel; level++) {
            totalExp += getExpForLevel(level + 1);
        }
        return totalExp;
    }

    function getExpProgress(level, currentExp) {
        const expForNextLevel = getExpForLevel(level + 1);
        if (expForNextLevel <= 0) {
            return 0;
        }
        return Math.min(100, Math.round((currentExp / expForNextLevel) * 10000) / 100);
    }

    function checkLevelUp() {
        const userData = getCurrentUserData();
        if (!userData) return false;

        const currentLevel = userData.level;
        const currentExp = userData.exp;
        const expNeeded = getExpForLevel(currentLevel + 1);

        if (currentExp >= expNeeded) {
            userData.level = currentLevel + 1;
            userData.exp = currentExp - expNeeded;
            userData.maxExp = getExpForLevel(currentLevel + 2);
            saveAccounts();
            return true;
        }
        return false;
    }

    function addExp(amount) {
        const userData = getCurrentUserData();
        if (!userData) {
            return { upgraded: false, level: 1, exp: 0, totalExp: 0 };
        }

        userData.exp += amount;
        let upgraded = false;
        let maxLevel = 120;

        while (userData.exp >= getExpForLevel(userData.level + 1) && userData.level < maxLevel) {
            upgraded = checkLevelUp();
        }

        const totalExp = getTotalExpForLevel(userData.level) + userData.exp;
        saveAccounts();

        return {
            upgraded: upgraded,
            level: userData.level,
            exp: userData.exp,
            totalExp: totalExp
        };
    }

    // 默认初始值：金币0，钻石0
    const DEFAULT_STATS = {
        level: 1,
        exp: 0,
        maxExp: 100,
        gold: 0,
        diamond: 0,
        characterClass: '平民',
    };

    function loadAccounts() {
        const stored = localStorage.getItem(STORAGE_ACCOUNTS);
        if (stored) {
            try {
                accounts = JSON.parse(stored) || {};
            } catch(e) {
                accounts = {};
            }
        }
        return accounts;
    }

    function saveAccounts() {
        localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
    }

    function getCurrentUser() {
        return localStorage.getItem(STORAGE_CURRENT_USER);
    }

    function getCurrentUserData() {
        if (!currentUser || !accounts[currentUser]) return null;
        const data = accounts[currentUser];
        // 补全默认值（初始金币钻石为0）
        if (data.level === undefined) data.level = DEFAULT_STATS.level;
        if (data.exp === undefined) data.exp = DEFAULT_STATS.exp;
        if (data.maxExp === undefined) data.maxExp = DEFAULT_STATS.maxExp;
        if (data.gold === undefined) data.gold = DEFAULT_STATS.gold;
        if (data.diamond === undefined) data.diamond = DEFAULT_STATS.diamond;
        if (!data.characterClass) data.characterClass = DEFAULT_STATS.characterClass;
        return data;
    }

    function refreshVillageUI() {
        if (!avatarImg || !charClassSpan || !charLevelSpan || !expBarFill || !expText || !goldSpan || !diamondSpan || !msgDiv) {
            return;
        }

        currentUser = getCurrentUser();
        if (!currentUser) {
            msgDiv.textContent = '⚠️ 未登录，请返回登录界面';
            avatarImg.src = `../image/main/平民头像.png`;
            charClassSpan.textContent = '平民';
            charLevelSpan.textContent = 'Lv.1';
            expBarFill.style.width = '0%';
            expText.textContent = '0/100';
            goldSpan.textContent = '0';
            diamondSpan.textContent = '0';
            return;
        }

        accounts = loadAccounts();
        const userData = getCurrentUserData();
        if (!userData) {
            msgDiv.textContent = '账户数据异常';
            return;
        }

        // 头像优先使用自定义
  if (userData.customAvatar) {
    avatarImg.src = userData.customAvatar;
  } else {
    avatarImg.src = `../image/main/${userData.characterClass}头像.png`;
  }
  
  // 昵称显示
  const nicknameEl = document.getElementById('nicknameDisplay');
  if (nicknameEl) {
    nicknameEl.textContent = userData.nickname || '冒险者';
  }
        
        charClassSpan.textContent = userData.characterClass;
        charLevelSpan.textContent = `Lv.${userData.level}`;

        const exp = userData.exp;
        const maxExp = userData.maxExp;
        const percent = maxExp > 0 ? (exp / maxExp) * 100 : 0;
        expBarFill.style.width = `${percent}%`;
        expText.textContent = `${exp}/${maxExp}`;

        goldSpan.textContent = userData.gold;
        diamondSpan.textContent = userData.diamond;
        if (evoCoinSpan) evoCoinSpan.textContent = (userData.items && userData.items.evolutionCoin) || 0;

        msgDiv.textContent = `👑 ${currentUser} · 欢迎回到霜落村`;
        renderEquippedItems();
    }

    function openBackpack() {
        if (backpackModal) {
            backpackModal.classList.add('open');
            renderBackpackItems();
        }
    }

    function closeBackpack() {
        if (backpackModal) {
            backpackModal.classList.remove('open');
        }
    }

    function getClearedFloors() {
        const userData = getCurrentUserData();
        return userData.clearedFloors || [];
    }

    function getMaxUnlockedFloor(clearedFloors) {
        if (clearedFloors.length === 0) return 1;
        const max = Math.max(...clearedFloors);
        return max + 1;
    }

    function initDungeonGrid() {
        const clearedFloors = getClearedFloors();

        // 处理10个大区的网格
        for (let section = 1; section <= 10; section++) {
            const gridElement = document.getElementById(`dungeonGrid${section}`);
            if (!gridElement) continue;

            const startFloor = (section - 1) * 10 + 1;
            const endFloor = section * 10;

            let html = '';
            for (let floor = startFloor; floor <= endFloor; floor++) {
                const monster = getMonsterData(floor);
                let cellClass = 'floor-cell';

                if (monster.isBoss) {
                    cellClass += ' boss';
                } else if (monster.isElite) {
                    cellClass += ' elite';
                }

                if (clearedFloors.includes(floor)) {
                    cellClass += ' cleared';
                } else if (floor > getMaxUnlockedFloor(clearedFloors)) {
                    cellClass += ' locked';
                }

                html += `<div class="${cellClass}" data-floor="${floor}">
                    <span class="floor-num">${floor}</span>
                    <img class="floor-img" src="../image/monster/${monster.img}" alt="${monster.name}">
                </div>`;
            }
            gridElement.innerHTML = html;
        }
    }

    function openDungeon() {
        if (dungeonModal) {
            initDungeonGrid();
            dungeonModal.classList.add('open');
        }
    }

    function closeDungeon() {
        if (dungeonModal) {
            dungeonModal.classList.remove('open');
        }
    }

    function startBattle(floor, options) {
        const userData = getCurrentUserData();
        if (!userData) {
            alert('请先登录！');
            return;
        }

        const monster = options && options.monster ? options.monster : getMonsterData(floor);
        const playerStats = getCharacterStats(userData.characterClass || '平民', userData.level || 1);

        const activePetIds = getActivePets();
        const allPets = getUserPets();
        const activePets = activePetIds.map(id => {
            const pet = allPets.find(p => p.id === id);
            return pet ? { ...pet } : null;
        }).filter(p => p !== null);

        battleState = {
            inBattle: true,
            currentFloor: floor,
            challengeMode: options?.mode || null,
            bossId: options?.bossId || null,
            evoCount: options?.evoCount || 0,
            wave: options?.wave || null,
            playerHp: playerStats.maxHp,
            playerMaxHp: playerStats.maxHp,
            playerAtk: playerStats.attack,
            playerDef: playerStats.defense,
            playerAtkSpeed: playerStats.atkSpeed,
            playerMagic: playerStats.magic,
            playerMaxMagic: playerStats.magic,
            playerCritRate: playerStats.critRate,
            monsterTier: monster.isBoss ? 'BOSS' : (monster.isElite ? '精英' : '普通'),
            monsterId: floor,
            playerBuffs: [],
            monsterDebuffs: [],
            monsterHp: monster.hp,
            monsterMaxHp: monster.maxHp || monster.hp,
            monsterAtk: monster.attack,
            monsterDef: monster.defense,
            monsterAtkSpeed: monster.atkSpeed || 1.0,
            monsterName: monster.name,
            monsterImg: monster.img,
            monsterIsBoss: monster.isBoss || false,
            monsterIsElite: monster.isElite || false,
            isDefending: false,
            isPlayerTurn: true,
            battleLog: [],
            canTame: true,
            activePets: activePets,
            cheatHpLock: userData.cheatHpLock || false,
            cheatMpLock: userData.cheatMpLock || false,
            cheatHitOn: userData.cheatHitOn || false,
            cheatKillOn: userData.cheatKillOn || false
        };

        if (battleFloor) battleFloor.textContent = options?.wave ? `第${options.wave}波` : floor;
        if (battleMonsterName) battleMonsterName.textContent = monster.name;
        if (playerBattleAvatar) playerBattleAvatar.src = `../image/main/${userData.characterClass || '平民'}头像.png`;
        if (playerBattleClass) playerBattleClass.textContent = userData.characterClass || '平民';
        if (playerBattleLevel) playerBattleLevel.textContent = userData.level || 1;
        if (monsterBattleAvatar) {
            if (monster.isAI) {
                monsterBattleAvatar.src = monster.img;
            } else {
                monsterBattleAvatar.src = `../image/monster/${monster.img}`;
            }
        }
        if (monsterName) monsterName.textContent = monster.name;

        updateBattleUI();

        closeDungeon();
        if (battleModal) {
            battleModal.classList.add('open');
        }

        if (options?.wave) {
            addBattleLog(`第${options.wave}波：${monster.name}出现了！`);
        } else if (options?.mode === 'bossEvolution') {
            addBattleLog(`👑 BOSS超进化：${monster.name}（进化${options.evoCount}次）出现了！`);
        } else {
            addBattleLog(`第${floor}层：${monster.name}出现了！`);
        }
        addBattleLog('你的回合，请选择行动！');
    }

    function initBackpackGrid() {
        if (!backpackGrid) return;
        let html = '';
        for (let i = 0; i < 60; i++) {
            html += `<div class="item-slot empty" data-slot="${i}"></div>`;
        }
        backpackGrid.innerHTML = html;
    }

    function renderBackpackItems() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const backpackItems = userData.backpackItems || [];
        const slots = backpackGrid.querySelectorAll('.item-slot');

        slots.forEach((slot, index) => {
            const item = backpackItems.find(item => item.slot === index);
            if (item) {
                slot.classList.remove('empty');
                let content = '';
                
                if (item.type === 'equipment') {
                    content = `<img src="../image/equipment/${item.name}.png" alt="${item.name}" class="item-icon" onerror="this.src='../image/equipment/新手铁剑.png'">`;
                } else {
                    content = `<span class="item-icon">${item.icon || '📦'}</span>`;
                }
                
                if (item.quantity && item.quantity > 1) {
                    content += `<span class="item-quantity">x${item.quantity}</span>`;
                }
                slot.innerHTML = content;
                slot.setAttribute('data-item-id', item.id || '');
                
                slot.onclick = () => {
                    if (item.type === 'consumable') {
                        showItemDetail(item);
                    } else if (item.type === 'equipment') {
                        showBackpackEquipmentDetail(item);
                    }
                };
            } else {
                slot.classList.add('empty');
                slot.innerHTML = '';
                slot.removeAttribute('data-item-id');
                slot.onclick = null;
            }
        });
    }

    function sortBackpackItems() {
        const userData = getCurrentUserData();
        if (!userData || !userData.backpackItems) return;

        const rarityOrder = { red: 0, orange: 1, purple: 2, blue: 3, green: 4, white: 5 };
        const typeOrder = { equipment: 0, consumable: 1 };

        userData.backpackItems.sort((a, b) => {
            const typeA = typeOrder[a.type] ?? 99;
            const typeB = typeOrder[b.type] ?? 99;
            if (typeA !== typeB) return typeA - typeB;

            const rarA = rarityOrder[a.rarity] ?? 99;
            const rarB = rarityOrder[b.rarity] ?? 99;
            if (rarA !== rarB) return rarA - rarB;

            return (a.name || '').localeCompare(b.name || '');
        });

        userData.backpackItems.forEach((item, index) => {
            item.slot = index;
        });

        saveAccounts();
        renderBackpackItems();
        showMessage('背包已整理！');
    }

    function renderEquippedItems() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const equipped = userData.equipped || {};
        const slotNames = { weapon: '武器', head: '头盔', chest: '衣服', legs: '裤子', boots: '鞋子', accessory: '饰品' };
        const slots = document.querySelectorAll('.equipment-slot');

        slots.forEach(slot => {
            const slotType = slot.dataset.slot;
            const equip = equipped[slotType];

            if (equip) {
                slot.classList.remove('empty');
                slot.innerHTML = `<img src="../image/equipment/${equip.name}.png" alt="${equip.name}" class="equip-slot-icon" onerror="this.src='../image/equipment/新手铁剑.png'"><span class="equip-slot-name">${equip.name}</span>`;
                slot.onclick = () => {
                    showBackpackEquipmentDetail(equip);
                };
            } else {
                slot.classList.add('empty');
                slot.innerHTML = `<span class="equip-slot-label">${slotNames[slotType] || slotType}</span>`;
                slot.onclick = null;
            }
        });
    }

    function useBackpackItem(item) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const itemData = ITEMS[item.name];
        if (!itemData) return;

        const inBattle = battleState?.inBattle;

        if (itemData.type === 'exp') {
            addExp(itemData.effect);
            showMessage(`使用了${item.name}，获得了${itemData.effect}点经验！`);
            item.quantity--;
            if (item.quantity <= 0) {
                const backpackItems = userData.backpackItems || [];
                const index = backpackItems.indexOf(item);
                if (index > -1) {
                    backpackItems.splice(index, 1);
                }
            }
            saveAccounts();
            renderBackpackItems();
            renderAttributesPanel();
            return;
        }

        if (itemData.type === 'heal' || itemData.type === 'mana' || itemData.type === 'buff' || itemData.type === 'tame') {
            if (!inBattle) {
                showMessage('请在战斗中使用此物品！');
                return;
            }

            let used = false;

            if (itemData.type === 'heal') {
                const healAmount = Math.floor(battleState.playerMaxHp * itemData.effect);
                battleState.playerHp = Math.min(battleState.playerHp + healAmount, battleState.playerMaxHp);
                showMessage(`使用了${item.name}，恢复了${healAmount}点生命！`);
                used = true;
            } else if (itemData.type === 'mana') {
                const manaAmount = Math.floor(battleState.playerMaxMagic * itemData.effect);
                battleState.playerMagic = Math.min(battleState.playerMagic + manaAmount, battleState.playerMaxMagic);
                showMessage(`使用了${item.name}，恢复了${manaAmount}点魔力！`);
                used = true;
            } else if (itemData.type === 'buff') {
                if (itemData.effect.criticalRate) {
                    battleState.buffCriticalRate = (battleState.buffCriticalRate || 0) + itemData.effect.criticalRate;
                    showMessage(`使用了${item.name}，本场战斗暴击率+${itemData.effect.criticalRate * 100}%！`);
                } if (itemData.effect.defense) {
                    battleState.buffDefense = (battleState.buffDefense || 0) + itemData.effect.defense;
                    showMessage(`使用了${item.name}，本场战斗防御+${itemData.effect.defense * 100}%！`);
                } if (itemData.effect.speed) {
                    battleState.buffSpeed = (battleState.buffSpeed || 0) + itemData.effect.speed;
                    showMessage(`使用了${item.name}，本场战斗速度+${itemData.effect.speed * 100}%！`);
                } if (itemData.effect.attack) {
                    battleState.buffAttack = (battleState.buffAttack || 0) + itemData.effect.attack;
                    showMessage(`使用了${item.name}，本场战斗攻击+${itemData.effect.attack * 100}%！`);
                }
                used = true;
            } else if (itemData.type === 'tame') {
                if (!battleState.canTame) {
                    showMessage('本场战斗已经使用过驯服！');
                    return;
                }

                const tameType = itemData.effect.type;
                let success = false;

                if (tameType === 'all') {
                    success = true;
                    addBattleLog(`📜 使用了创世契约，驯服了${battleState.monsterName}！`);
                    defeatMonster(battleState.monsterId, battleState.monsterIsBoss ? 'boss' : (battleState.monsterIsElite ? 'elite' : 'normal'));
                    userData.hasTamed = true;
                } else if (tameType === 'elite' && battleState.monsterIsElite) {
                    success = true;
                    addBattleLog(`📜 使用了契约卷轴，驯服了${battleState.monsterName}！`);
                    defeatMonster(battleState.monsterId, 'elite');
                } else if (tameType === 'normal' && !battleState.monsterIsElite && !battleState.monsterIsBoss) {
                    success = true;
                    addBattleLog(`📜 使用了通灵卷轴，驯服了${battleState.monsterName}！`);
                    defeatMonster(battleState.monsterId, 'normal');
                } else {
                    addBattleLog(`📜 ${item.name}无法驯服该怪物！`);
                }

                if (success) {
                    const pet = createPetFromMonster(battleState.monsterName, battleState.monsterImg);
                    if (pet) {
                        const userData = getCurrentUserData();
                        if (userData && userData.pets && userData.pets.length < 60) {
                            addPetToInventory(pet);
                            addBattleLog(`🎉 宠物已加入背包！`);
                        } else {
                            addBattleLog(`❌ 宠物背包已满，无法容纳新宠物！`);
                        }
                    }
                    battleState.canTame = false;
                    item.quantity--;
                    if (item.quantity <= 0) {
                        const backpackItems = userData.backpackItems || [];
                        const index = backpackItems.indexOf(item);
                        if (index > -1) {
                            backpackItems.splice(index, 1);
                        }
                    }
                    saveAccounts();
                    renderBackpackItems();
                    setTimeout(() => {
                        battleWin(true);
                    }, 500);
                } else {
                    battleState.isPlayerTurn = false;
                    setTimeout(monsterTurn, 800);
                }
            }

            if (used && itemData.type !== 'tame') {
                item.quantity--;
                if (item.quantity <= 0) {
                    const backpackItems = userData.backpackItems || [];
                    const index = backpackItems.indexOf(item);
                    if (index > -1) {
                        backpackItems.splice(index, 1);
                    }
                }
                saveAccounts();
                renderBackpackItems();
                updateBattleUI();
                battleState.isPlayerTurn = false;
                setTimeout(monsterTurn, 800);
            }
            return;
        }

        showMessage('无法使用此物品！');
    }

    function showItemDetail(item) {
        const modal = document.getElementById('itemDetailModal');
        if (!modal) return;

        const userData = getCurrentUserData();
        if (!userData) return;

        const itemData = ITEMS[item.name];
        const desc = itemData?.desc || itemData?.description || '';
        const icon = item.icon || '📦';

        document.getElementById('itemDetailName').textContent = item.name;
        document.getElementById('itemDetailIcon').textContent = icon;
        document.getElementById('itemDetailDesc').textContent = desc;
        document.getElementById('itemDetailQty').textContent = item.quantity || 1;

        const deletePanel = document.getElementById('itemDetailDeletePanel');
        deletePanel.style.display = 'none';
        let deleteCount = 1;

        modal.style.display = 'flex';

        const closeBtn = modal.querySelector('.item-detail-close');
        const backdrop = modal.querySelector('.item-detail-backdrop');

        const closeModal = () => {
            modal.style.display = 'none';
            closeBtn?.removeEventListener('click', closeModal);
            backdrop?.removeEventListener('click', closeModal);
        };

        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        const useBtn = document.getElementById('itemDetailUseBtn');
        useBtn.onclick = () => {
            useBackpackItem(item);
            const updatedItem = (userData.backpackItems || []).find(i => i.id === item.id);
            if (updatedItem) {
                document.getElementById('itemDetailQty').textContent = updatedItem.quantity || 1;
            } else {
                closeModal();
            }
        };

        const deleteBtn = document.getElementById('itemDetailDeleteBtn');
        deleteBtn.onclick = () => {
            deleteCount = 1;
            document.getElementById('deleteCount').textContent = 1;
            deletePanel.style.display = 'block';
        };

        document.getElementById('deleteMinusBtn').onclick = () => {
            if (deleteCount > 1) {
                deleteCount--;
                document.getElementById('deleteCount').textContent = deleteCount;
            }
        };

        document.getElementById('deletePlusBtn').onclick = () => {
            if (deleteCount < (item.quantity || 1)) {
                deleteCount++;
                document.getElementById('deleteCount').textContent = deleteCount;
            }
        };

        document.getElementById('deleteConfirmBtn').onclick = () => {
            const currentItem = (userData.backpackItems || []).find(i => i.id === item.id);
            if (!currentItem) { closeModal(); return; }

            currentItem.quantity -= deleteCount;
            if (currentItem.quantity <= 0) {
                const idx = userData.backpackItems.indexOf(currentItem);
                if (idx > -1) userData.backpackItems.splice(idx, 1);
            }

            saveAccounts();
            renderBackpackItems();
            showMessage(`删除了${deleteCount}个${item.name}`);
            closeModal();
        };

        document.getElementById('deleteCancelBtn').onclick = () => {
            deletePanel.style.display = 'none';
        };
    }

    function renderAttributesPanel() {
        const userData = getCurrentUserData();
        if (!userData) return;

        const className = userData.characterClass || '平民';
        const level = userData.level || 1;

        const stats = getCharacterStats(className, level);

        const eb = stats.equipBonus || {};
        const rb = stats.runeBonus || {};
        const tb = stats.talentBonus || {};

        function bonusTag(val) {
            if (val && val > 0) return `<span class="attr-bonus">(+${val})</span>`;
            return '';
        }

        function pctBonusTag(val) {
            if (val && val > 0) return `<span class="attr-bonus">(+${val.toFixed(1)}%)</span>`;
            return '';
        }

        const totalEquipAtk = (eb.attack || 0);
        const totalRuneAtk = (rb.attack || 0);
        const totalTalentAtk = (tb.attack || 0);
        const atkBonus = totalEquipAtk + totalRuneAtk;

        const totalEquipDef = (eb.defense || 0);
        const totalRuneDef = (rb.defense || 0);
        const totalTalentDef = (tb.defense || 0);
        const defBonus = totalEquipDef + totalRuneDef;

        const totalEquipHp = (eb.maxHp || 0);
        const totalRuneHp = (rb.hp || 0);
        const totalTalentHp = (tb.maxHp || 0);
        const hpBonus = totalEquipHp + totalRuneHp;

        const totalEquipMagic = (eb.magic || 0);
        const totalRuneMagic = (rb.magic || 0);
        const totalTalentMagic = (tb.magic || 0);
        const magicBonus = totalEquipMagic + totalRuneMagic;

        const totalEquipAtkSpd = (eb.atkSpeed || 0);
        const totalRuneAtkSpd = (rb.atkSpeed || 0);
        const totalTalentAtkSpd = (tb.atkSpeed || 0);
        const atkSpdBonus = totalEquipAtkSpd + totalRuneAtkSpd;

        const totalEquipCrit = (eb.critRate || 0);
        const totalRuneCrit = (rb.critRate || 0);
        const totalTalentCrit = (tb.critRate || 0);
        const critBonus = totalEquipCrit + totalRuneCrit;

        const panel = document.querySelector('.attributes-panel');
        if (!panel) return;

        const html = `
            <div class="class-info">
                <h3>${className}</h3>
                <span class="level-badge">Lv.${level}</span>
            </div>

            <div class="attr-section">
                <h4 class="attr-section-title">七维属性</h4>
                <div class="attr-grid">
                    <div class="attr-item">
                        <span class="attr-name">⚔️ 力量</span>
                        <span class="attr-value">${stats.strength}</span>
                    </div>
                    <div class="attr-item">
                        <span class="attr-name">🛡️ 体质</span>
                        <span class="attr-value">${stats.constitution}</span>
                    </div>
                    <div class="attr-item">
                        <span class="attr-name">💨 敏捷</span>
                        <span class="attr-value">${stats.agility}</span>
                    </div>
                    <div class="attr-item">
                        <span class="attr-name">👁️ 感知</span>
                        <span class="attr-value">${stats.perception}</span>
                    </div>
                    <div class="attr-item">
                        <span class="attr-name">📖 智力</span>
                        <span class="attr-value">${stats.intelligence}</span>
                    </div>
                    <div class="attr-item">
                        <span class="attr-name">🍀 幸运</span>
                        <span class="attr-value">${stats.luck}</span>
                    </div>
                </div>
            </div>

            <div class="attr-section">
                <h4 class="attr-section-title">战斗属性</h4>
                <div class="attr-grid">
                    <div class="attr-item battle">
                        <span class="attr-name">❤️ 生命</span>
                        <span class="attr-value">${stats.maxHp}${bonusTag(hpBonus)}${pctBonusTag(totalTalentHp)}</span>
                    </div>
                    <div class="attr-item battle">
                        <span class="attr-name">⚔️ 攻击</span>
                        <span class="attr-value">${stats.attack}${bonusTag(atkBonus)}${pctBonusTag(totalTalentAtk)}</span>
                    </div>
                    <div class="attr-item battle">
                        <span class="attr-name">🛡️ 防御</span>
                        <span class="attr-value">${stats.defense}${bonusTag(defBonus)}${pctBonusTag(totalTalentDef)}</span>
                    </div>
                    <div class="attr-item battle">
                        <span class="attr-name">✨ 魔力</span>
                        <span class="attr-value">${stats.magic}${bonusTag(magicBonus)}${pctBonusTag(totalTalentMagic)}</span>
                    </div>
                    <div class="attr-item battle">
                        <span class="attr-name">⚡ 攻速</span>
                        <span class="attr-value">${stats.atkSpeed}${bonusTag(atkSpdBonus)}${pctBonusTag(totalTalentAtkSpd)}</span>
                    </div>
                    <div class="attr-item battle">
                        <span class="attr-name">🏃 移速</span>
                        <span class="attr-value">${stats.moveSpeed}</span>
                    </div>
                </div>
            </div>

            <div class="attr-section">
                <h4 class="attr-section-title">特殊属性</h4>
                <div class="attr-grid">
                    <div class="attr-item special">
                        <span class="attr-name">💥 暴击率</span>
                        <span class="attr-value">${stats.critRate}%${pctBonusTag(critBonus)}${pctBonusTag(totalTalentCrit)}</span>
                    </div>
                    <div class="attr-item special">
                        <span class="attr-name">💎 稀有掉落</span>
                        <span class="attr-value">${stats.rareDropRate}%</span>
                    </div>
                </div>
            </div>
        `;

        panel.innerHTML = html;
    }

    function switchTab(tabName) {
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const backpackSection = document.querySelector('.backpack-items-section');
        const panel = document.querySelector('.attributes-panel');

        if (tabName === 'backpack') {
            if (backpackSection) backpackSection.style.display = 'block';
            if (panel) panel.style.display = 'none';
        } else if (tabName === 'attributes') {
            if (backpackSection) backpackSection.style.display = 'none';
            if (panel) {
                panel.style.display = 'block';
                renderAttributesPanel();
            }
        }
    }

    function bindEvents() {
        if (avatarBox) {
            avatarBox.addEventListener('click', () => {
                window.location.href = 'setting.html';
            });
        }

        const codexBtn = document.querySelector('.right-vertical-buttons .circle-icon-btn:first-child');
        if (codexBtn) {
            codexBtn.addEventListener('click', openCodex);
        }

        const giftBtn = document.querySelector('.right-vertical-buttons .gift-btn');
        if (giftBtn) {
            giftBtn.addEventListener('click', openGift);
        }

        const redeemBtn = document.querySelector('.right-vertical-buttons .redeem-btn');
        if (redeemBtn) {
            redeemBtn.addEventListener('click', openRedeem);
        }

        const allNavBtns = document.querySelectorAll('.nav-btn, .side-btn');
        allNavBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = btn.textContent.trim();
                if (msgDiv) {
                    msgDiv.textContent = `✨ 「${text}」功能筹备中，敬请期待`;
                }
            });
        });

        const backpackBtn = document.querySelector('.nav-btn:first-child');
        if (backpackBtn) {
            backpackBtn.addEventListener('click', openBackpack);
        }

        const battleBtn = document.querySelector('.nav-btn.nav-btn-large');
        if (battleBtn) {
            battleBtn.addEventListener('click', openDungeon);
        }

        const dungeonSelectBtn = document.getElementById('dungeonSelectBtn');
        if (dungeonSelectBtn) {
            dungeonSelectBtn.addEventListener('click', openDungeon);
        }

        const petBtn = document.querySelector('.bottom-nav .nav-btn:nth-child(2)');
        if (petBtn) {
            petBtn.addEventListener('click', openPetInventory);
        }

        const runeBtn = document.querySelector('.bottom-nav .nav-btn:nth-child(3)');
        if (runeBtn) {
            runeBtn.addEventListener('click', openRuneSidebar);
        }

        const skillBtn = document.querySelector('.skill-btn');
        if (skillBtn) {
            skillBtn.addEventListener('click', openSkillPanel);
        }

        const talentBtn = document.querySelector('.talent-btn');
        if (talentBtn) {
            talentBtn.addEventListener('click', openTalentPanel);
        }

        const talentResetDiamondBtn = document.getElementById('talentResetDiamond');
        if (talentResetDiamondBtn) {
            talentResetDiamondBtn.addEventListener('click', resetTalentsWithDiamond);
        }

        const talentResetGoldBtn = document.getElementById('talentResetGold');
        if (talentResetGoldBtn) {
            talentResetGoldBtn.addEventListener('click', resetTalentsWithGold);
        }

        const challengeBtn = document.querySelector('.challenge-btn');
        if (challengeBtn) {
            challengeBtn.addEventListener('click', openChallengePanel);
        }

        const shopBtn = document.querySelector('.shop-btn');
        if (shopBtn) {
            shopBtn.addEventListener('click', openShop);
        }

        const modePvP = document.getElementById('modePvP');
        if (modePvP) {
            modePvP.addEventListener('click', startPvPChallenge);
        }

        const modeEndless = document.getElementById('modeEndless');
        if (modeEndless) {
            modeEndless.addEventListener('click', startEndlessChallenge);
        }

        const modeBossEvo = document.getElementById('modeBossEvo');
        if (modeBossEvo) {
            modeBossEvo.addEventListener('click', showBossPreview);
        }

        const petCloseBtn = document.querySelector('.pet-close');
        if (petCloseBtn) {
            petCloseBtn.addEventListener('click', closePetInventory);
        }

        const petBackdrop = document.querySelector('.pet-backdrop');
        if (petBackdrop) {
            petBackdrop.addEventListener('click', closePetInventory);
        }

        const petReleaseBtn = document.getElementById('petReleaseBtn');
        if (petReleaseBtn) {
            petReleaseBtn.addEventListener('click', togglePetReleaseMode);
        }

        const petSortBtn = document.getElementById('petSortBtn');
        if (petSortBtn) {
            petSortBtn.addEventListener('click', sortPetInventory);
        }

        const petGrid = document.getElementById('petGrid');
        if (petGrid) {
            petGrid.addEventListener('click', (e) => {
                const petCard = e.target.closest('.pet-card:not(.empty)');
                if (petCard) {
                    const petId = petCard.dataset.petId;
                    if (petId) {
                        if (petReleaseMode) {
                            confirmReleasePet(petId);
                        } else {
                            togglePetActive(petId);
                        }
                    }
                }
            });
        }

        const activePetsSlots = document.querySelectorAll('.pet-slot');
        if (activePetsSlots) {
            activePetsSlots.forEach(slot => {
                slot.addEventListener('click', () => {
                    const petId = slot.dataset.petId;
                    if (petId) {
                        togglePetActive(petId);
                    }
                });
            });
        }

        if (backpackCloseBtn) {
            backpackCloseBtn.addEventListener('click', closeBackpack);
        }

        if (backpackBackdrop) {
            backpackBackdrop.addEventListener('click', closeBackpack);
        }

        const backpackSortBtn = document.getElementById('backpackSortBtn');
        if (backpackSortBtn) {
            backpackSortBtn.addEventListener('click', sortBackpackItems);
        }

        if (tabBtns) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.getAttribute('data-tab');
                    switchTab(tab);
                });
            });
        }
    }

    function init() {
        avatarImg = document.getElementById('playerAvatar');
        avatarBox = document.getElementById('avatarBox');
        charClassSpan = document.getElementById('charClassDisplay');
        charLevelSpan = document.getElementById('charLevelDisplay');
        expBarFill = document.getElementById('expBarFill');
        expText = document.getElementById('expText');
        goldSpan = document.getElementById('goldAmount');
        diamondSpan = document.getElementById('diamondAmount');
        evoCoinSpan = document.getElementById('evoCoinAmount');
        msgDiv = document.getElementById('villageMessage');

        backpackModal = document.getElementById('backpackModal');
        backpackGrid = document.getElementById('backpackGrid');
        attributesPanel = document.querySelector('.attributes-panel');
        tabBtns = document.querySelectorAll('.tab-btn');
        backpackCloseBtn = document.querySelector('.backpack-close');
        backpackBackdrop = document.querySelector('.backpack-backdrop');

        const user = getCurrentUser();
        if (user) {
            accounts = loadAccounts();
            if (accounts[user]) {
                const data = accounts[user];
                // 如果之前金币钻石未定义或为旧值，统一初始化为0（仅当不存在时）
                if (data.gold === undefined) data.gold = 0;
                if (data.diamond === undefined) data.diamond = 0;
                if (data.level === undefined) data.level = 1;
                if (data.exp === undefined) data.exp = 0;
                if (data.maxExp === undefined) data.maxExp = 100;
                if (!data.characterClass) data.characterClass = '平民';
                
                // 图鉴相关字段初始化
                if (data.collectedEquipment === undefined) data.collectedEquipment = [];
                if (data.collectedItems === undefined) data.collectedItems = [];
                if (data.defeatedMonsters === undefined) {
                    data.defeatedMonsters = {
                        normals: [],
                        elites: [],
                        bosses: []
                    };
                }
                if (data.achievements === undefined) data.achievements = [];
                if (data.battleWins === undefined) data.battleWins = 0;
                if (data.totalGoldEarned === undefined) data.totalGoldEarned = 0;
                if (data.totalDiamondEarned === undefined) data.totalDiamondEarned = 0;
                if (data.totalCrits === undefined) data.totalCrits = 0;
                
                saveAccounts();
            }
        }
        refreshVillageUI();
        bindEvents();
        initBackpackGrid();

        dungeonModal = document.getElementById('dungeonModal');
        battleModal = document.getElementById('battleModal');
        petModal = document.getElementById('petModal');

        battleFloor = document.querySelector('.battle-floor');
        battleMonsterName = document.querySelector('.battle-monster-name');
        playerBattleAvatar = document.getElementById('playerBattleAvatar');
        playerBattleClass = document.getElementById('playerBattleClass');
        playerBattleLevel = document.getElementById('playerBattleLevel');
        playerHpBar = document.getElementById('playerHpBar');
        playerCurrentHp = document.getElementById('playerCurrentHp');
        playerMaxHp = document.getElementById('playerMaxHp');
        playerMagicBar = document.getElementById('playerMagicBar');
        playerCurrentMagic = document.getElementById('playerCurrentMagic');
        playerMaxMagic = document.getElementById('playerMaxMagic');
        monsterBattleAvatar = document.getElementById('monsterBattleAvatar');
        monsterName = document.getElementById('monsterName');
        monsterHpBar = document.getElementById('monsterHpBar');
        monsterCurrentHp = document.getElementById('monsterCurrentHp');
        monsterMaxHp = document.getElementById('monsterMaxHp');
        monsterAtk = document.getElementById('monsterAtk');
        monsterDef = document.getElementById('monsterDef');
        battleLog = document.getElementById('battleLog');
        actionBtns = document.querySelectorAll('.action-btn');

        initBattleSkillSelect();
        initItemSelect();

        const purchaseConfirmModal = document.getElementById('purchaseConfirmModal');
        const purchaseCancelBtn = document.getElementById('purchaseCancelBtn');
        const purchaseOkBtn = document.getElementById('purchaseOkBtn');

        if (purchaseCancelBtn) {
            purchaseCancelBtn.addEventListener('click', () => {
                if (purchaseConfirmModal) {
                    purchaseConfirmModal.classList.remove('active');
                    purchaseConfirmModal.style.display = 'none';
                }
                pendingPurchase = null;
            });
        }

        if (purchaseOkBtn) {
            purchaseOkBtn.addEventListener('click', () => {
                if (pendingPurchase) {
                    if (purchaseConfirmModal) {
                        purchaseConfirmModal.classList.remove('active');
                        purchaseConfirmModal.style.display = 'none';
                    }
                    const { type, data } = pendingPurchase;
                    if (type === 'item') {
                        executeBuyItem(data);
                    } else if (type === 'equipment') {
                        executeBuyEquipment(data);
                    }
                    pendingPurchase = null;
                }
            });
        }

        if (battleModal) {
            const backdrop = dungeonModal.querySelector('.dungeon-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', closeDungeon);
            }
            const closeBtn = dungeonModal.querySelector('.dungeon-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeDungeon);
            }
        }

        // 为所有10个地宫网格添加事件监听
        for (let section = 1; section <= 10; section++) {
            const gridElement = document.getElementById(`dungeonGrid${section}`);
            if (gridElement) {
                gridElement.addEventListener('click', (e) => {
                    const cell = e.target.closest('.floor-cell');
                    if (!cell) return;

                    const floor = parseInt(cell.dataset.floor);
                    const clearedFloors = getClearedFloors();
                    const maxUnlocked = getMaxUnlockedFloor(clearedFloors);

                    if (floor > maxUnlocked) {
                        addBattleLog(`需要先通关第${maxUnlocked - 1}层！`);
                        return;
                    }

                    startBattle(floor);
                });
            }
        }

        if (battleModal) {
            const backdrop = battleModal.querySelector('.battle-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', closeBattle);
            }
            const closeBtn = battleModal.querySelector('.battle-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeBattle);
            }
        }

        if (actionBtns) {
            actionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;

                    if (action === 'attack') {
                        playerAttack();
                    } else if (action === 'defend') {
                        playerDefend();
                    } else if (action === 'skill') {
                        playerSkill();
                    } else if (action === 'item') {
                        openItemSelect();
                    } else if (action === 'surrender') {
                        playerSurrender();
                    } else if (action === 'tame') {
                        playerTame();
                    }
                });
            });
        }
    }

    function initBattleSkillSelect() {
        skillSelectModal = document.getElementById('battleSkillSelect');
        skillSelectList = document.getElementById('skillSelectList');
        
        if (!skillSelectModal || !skillSelectList) return;
        
        const closeBtn = skillSelectModal.querySelector('.skill-select-close');
        const backdrop = skillSelectModal.querySelector('.skill-select-backdrop');
        closeBtn?.addEventListener('click', closeSkillSelect);
        backdrop?.addEventListener('click', closeSkillSelect);
    }

    function openSkillSelect() {
        if (!skillSelectModal || !skillSelectList) return;
        
        const skills = getPlayerSkills();
        let html = '';
        
        skills.forEach(skill => {
            const currentLevel = getSkillLevel(skill.id);
            const isDisabled = battleState.playerMagic < skill.magicCost;
            
            html += `
                <div class="skill-select-item ${isDisabled ? 'disabled' : ''}" data-skill-id="${skill.id}">
                    <div class="skill-select-name">${skill.name}</div>
                    <div class="skill-select-cost">魔力: ${skill.magicCost}</div>
                    <div class="skill-select-level">Lv.${currentLevel}</div>
                    <div class="skill-select-desc">${skill.description}</div>
                </div>
            `;
        });
        
        skillSelectList.innerHTML = html;
        skillSelectModal.style.display = 'flex';
        
        const items = document.querySelectorAll('.skill-select-item:not(.disabled)');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const skillId = item.dataset.skillId;
                useSkill(skillId);
                closeSkillSelect();
            });
        });
    }

    function closeSkillSelect() {
        if (skillSelectModal) {
            skillSelectModal.style.display = 'none';
        }
    }

    let itemSelectModal, itemSelectList;

    function initItemSelect() {
        itemSelectModal = document.getElementById('itemSelectModal');
        itemSelectList = document.getElementById('itemSelectList');
        
        if (!itemSelectModal || !itemSelectList) return;
        
        const closeBtn = document.getElementById('itemSelectClose');
        const backdrop = itemSelectModal.querySelector('.item-select-backdrop');
        closeBtn?.addEventListener('click', closeItemSelect);
        backdrop?.addEventListener('click', closeItemSelect);
    }

    function openItemSelect() {
        if (!itemSelectModal || !itemSelectList) return;
        
        const userData = getCurrentUserData();
        const backpackItems = userData?.backpackItems || [];
        const consumableItems = backpackItems.filter(item => item.type === 'consumable' && item.quantity > 0);
        
        let html = '';
        
        if (consumableItems.length === 0) {
            html = '<div class="item-select-empty">暂无可使用的物品</div>';
        } else {
            consumableItems.forEach(item => {
                const itemData = ITEMS[item.name];
                const desc = itemData?.desc || '';
                
                html += `
                    <div class="item-select-card" data-item-id="${item.id}" data-item-name="${item.name}">
                        <div class="item-select-icon">${item.icon}</div>
                        <div class="item-select-info">
                            <div class="item-select-name">${item.name}</div>
                            <div class="item-select-desc">${desc}</div>
                        </div>
                        <div class="item-select-quantity">x${item.quantity}</div>
                    </div>
                `;
            });
        }
        
        itemSelectList.innerHTML = html;
        itemSelectModal.style.display = 'flex';
        
        const cards = itemSelectList.querySelectorAll('.item-select-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.itemId;
                const itemName = card.dataset.itemName;
                useItem(itemId, itemName);
            });
        });
    }

    function closeItemSelect() {
        if (itemSelectModal) {
            itemSelectModal.style.display = 'none';
        }
    }

    function useItem(itemId, itemName) {
        const userData = getCurrentUserData();
        if (!userData) return;
        
        const backpackItems = userData.backpackItems || [];
        const item = backpackItems.find(i => i.id === itemId);
        if (!item || item.quantity <= 0) return;
        
        const itemData = ITEMS[itemName];
        if (!itemData) return;
        
        let used = false;
        
        if (itemData.type === 'heal') {
            const healAmount = Math.floor(battleState.playerMaxHp * itemData.effect);
            battleState.playerHp = Math.min(battleState.playerHp + healAmount, battleState.playerMaxHp);
            addBattleLog(`使用了${itemName}，恢复了${healAmount}点生命！`);
            used = true;
        } else if (itemData.type === 'mana') {
            const manaAmount = Math.floor(battleState.playerMaxMagic * itemData.effect);
            battleState.playerMagic = Math.min(battleState.playerMagic + manaAmount, battleState.playerMaxMagic);
            addBattleLog(`使用了${itemName}，恢复了${manaAmount}点魔力！`);
            used = true;
        } else if (itemData.type === 'buff') {
            if (itemData.effect.criticalRate) {
                battleState.buffCriticalRate = (battleState.buffCriticalRate || 0) + itemData.effect.criticalRate;
                addBattleLog(`使用了${itemName}，暴击率提升${Math.floor(itemData.effect.criticalRate * 100)}%！`);
            }
            if (itemData.effect.defense) {
                battleState.buffDefense = (battleState.buffDefense || 0) + itemData.effect.defense;
                addBattleLog(`使用了${itemName}，防御力提升${Math.floor(itemData.effect.defense * 100)}%！`);
            }
            if (itemData.effect.speed) {
                battleState.buffSpeed = (battleState.buffSpeed || 0) + itemData.effect.speed;
                addBattleLog(`使用了${itemName}，攻击速度提升${Math.floor(itemData.effect.speed * 100)}%！`);
            }
            if (itemData.effect.attack) {
                battleState.buffAttack = (battleState.buffAttack || 0) + itemData.effect.attack;
                addBattleLog(`使用了${itemName}，攻击力提升${Math.floor(itemData.effect.attack * 100)}%！`);
            }
            used = true;
        } else if (itemData.type === 'tame') {
            if (!battleState.canTame) {
                addBattleLog('本场战斗已经使用过驯服！');
                return;
            }
            
            const monsterType = itemData.effect.type;
            let canTame = false;
            
            if (monsterType === 'all') {
                canTame = true;
            } else if (monsterType === 'normal' && !battleState.monsterIsBoss && !battleState.monsterIsElite) {
                canTame = true;
            } else if (monsterType === 'elite' && battleState.monsterIsElite) {
                canTame = true;
            }
            
            if (canTame) {
                const pet = createPetFromMonster(battleState.monsterName, battleState.monsterImg);
                if (pet && !isPetInventoryFull()) {
                    addPetToInventory(pet);
                    addBattleLog(`使用了${itemName}，驯服了${battleState.monsterName}！宠物已加入背包！`);
                } else {
                    addBattleLog(`使用了${itemName}，驯服了${battleState.monsterName}！但宠物背包已满！`);
                }
                battleState.canTame = false;
                const monsterTypeStr = battleState.monsterIsBoss ? 'boss' : (battleState.monsterIsElite ? 'elite' : 'normal');
                defeatMonster(battleState.monsterId, monsterTypeStr);
                used = true;
                battleWin(true);
            } else {
                addBattleLog(`${itemName}无法驯服该怪物！`);
                return;
            }
        }
        
        if (used) {
            item.quantity--;
            if (item.quantity <= 0) {
                const index = backpackItems.indexOf(item);
                if (index > -1) {
                    backpackItems.splice(index, 1);
                }
            }
            saveAccounts();
            updateBattleUI();
            closeItemSelect();
            
            if (itemData.type !== 'tame') {
                battleState.isPlayerTurn = false;
                setTimeout(monsterTurn, 800);
            }
        }
    }

    function openSkillPanel() {
        const skillModal = document.getElementById('skillModal');
        const skillsSection = document.getElementById('skillsSection');
        if (!skillModal || !skillsSection) return;

        const skills = getPlayerSkills();
        let html = '';

        skills.forEach(skill => {
            const currentLevel = getSkillLevel(skill.id);
            const maxLevel = skill.maxLevel || 10;
            const upgradeCost = getSkillUpgradeCost(skill.id);
            
            let upgradeBtnHtml = '';
            if (currentLevel < maxLevel && upgradeCost) {
                const currencyIcon = upgradeCost.type === 'gold' ? '💰' : '💎';
                upgradeBtnHtml = `
                    <button class="upgrade-btn" data-skill-id="${skill.id}">
                        <span class="upgrade-cost">升级: ${currencyIcon} ${upgradeCost.amount}</span>
                    </button>
                `;
            } else if (currentLevel >= maxLevel) {
                upgradeBtnHtml = '<div class="skill-max-level">已满级</div>';
            }

            const skillTypeText = getSkillTypeText(skill.type);

            html += `
                <div class="skill-card" data-skill-id="${skill.id}">
                    <div class="skill-info">
                        <div class="skill-name">${skill.name} <span class="skill-type">${skillTypeText}</span></div>
                        <div class="skill-description">${skill.description}</div>
                        <div class="skill-stats">
                            <span class="skill-level">等级: <span class="level-value">${currentLevel}</span>/${maxLevel}</span>
                            <span class="skill-cost">魔力消耗: <span class="cost-value">${skill.magicCost}</span></span>
                        </div>
                        <div class="skill-effect">
                            <span>效果: ${getSkillEffectText(skill, currentLevel)}</span>
                        </div>
                    </div>
                    <div class="skill-upgrade">
                        ${upgradeBtnHtml}
                    </div>
                </div>
            `;
        });

        skillsSection.innerHTML = html;
        skillModal.classList.add('open');

        // 绑定升级按钮事件
        const upgradeBtns = document.querySelectorAll('.upgrade-btn');
        upgradeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const skillId = btn.dataset.skillId;
                const result = upgradeSkill(skillId);
                
                if (result.success) {
                    if (msgDiv) {
                        msgDiv.textContent = result.message;
                    }
                    openSkillPanel(); // 刷新面板
                } else {
                    if (msgDiv) {
                        msgDiv.textContent = result.message;
                    }
                }
            });
        });

        // 绑定关闭事件
        const closeBtn = document.querySelector('.skill-close');
        const backdrop = document.querySelector('.skill-backdrop');
        closeBtn?.addEventListener('click', () => {
            skillModal.classList.remove('open');
        });
        backdrop?.addEventListener('click', () => {
            skillModal.classList.remove('open');
        });
    }

    function getSkillTypeText(type) {
        switch (type) {
            case SKILL_TYPE.ATTACK: return '攻击';
            case SKILL_TYPE.DEFENSE: return '防御';
            case SKILL_TYPE.BUFF: return '增益';
            case SKILL_TYPE.DEBUFF: return '减益';
            case SKILL_TYPE.HEAL: return '治疗';
            case SKILL_TYPE.SPECIAL: return '特殊';
            default: return '普通';
        }
    }

    function getSkillEffectText(skill, level) {
        const bonus = (level - 1) * skill.levelBonus;
        
        if (skill.type === SKILL_TYPE.ATTACK) {
            return `${skill.baseDamage + bonus}%攻击力`;
        } else if (skill.type === SKILL_TYPE.HEAL) {
            return `恢复${skill.baseDamage + bonus + '+魔力×0.8'}生命`;
        } else if (skill.type === SKILL_TYPE.DEFENSE) {
            return `吸收${skill.baseDamage + bonus + '+魔力×0.5'}伤害`;
        } else if (skill.type === SKILL_TYPE.BUFF) {
            return `${skill.effectType || '攻击'}+${skill.baseEffect + bonus}%`;
        } else if (skill.type === SKILL_TYPE.DEBUFF) {
            return `伤害${skill.baseDamage + bonus}%，${skill.effectType || '防御'}-${skill.baseEffect + bonus}%`;
        } else {
            return skill.description;
        }
    }

    function getSkillById(skillId) {
        const skills = getPlayerSkills();
        return skills.find(s => s.id === skillId);
    }

    function useSkill(skillId) {
        if (!battleState.inBattle || !battleState.isPlayerTurn) return;
        
        const skill = getSkillById(skillId);
        if (!skill) return;
        
        if (battleState.playerMagic < skill.magicCost) {
            addBattleLog('❌ 魔力不足！');
            updateBattleUI();
            return;
        }
        
        const userData = getCurrentUserData();
        if (!userData?.cheatMpLock) {
            battleState.playerMagic -= skill.magicCost;
        } else {
            addBattleLog(`使用了${skill.name}（魔力锁定中）！`);
        }

        const currentLevel = getSkillLevel(skillId);
        const playerStats = getCharacterStats(userData.characterClass || '平民', userData.level || 1);
        
        let damage = 0;
        let logMsg = `你使用了${skill.name}！`;
        
        switch (skill.type) {
            case SKILL_TYPE.ATTACK:
                const damagePercent = skill.baseDamage + (currentLevel - 1) * (skill.levelBonus || 0);
                damage = Math.floor((playerStats.attack + playerStats.magic * 0.5) * damagePercent / 100);
                battleState.monsterHp = Math.max(0, battleState.monsterHp - damage);
                logMsg += ` 造成了${damage}点伤害！`;
                
                if (skill.effectType === 'lifesteal') {
                    const lifestealAmount = Math.floor(damage * (skill.baseEffect + (currentLevel - 1) * (skill.effectBonus || 0)) / 100);
                    battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + lifestealAmount);
                    logMsg += ` 吸取了${lifestealAmount}点生命！`;
                }
                break;
                
            case SKILL_TYPE.HEAL:
                const healAmount = skill.baseDamage + Math.floor(playerStats.magic * 0.8) + (currentLevel - 1) * (skill.levelBonus || 0);
                battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + healAmount);
                logMsg += ` 恢复了${healAmount}点生命！`;
                break;
                
            case SKILL_TYPE.DEFENSE:
                const shieldAmount = skill.baseDamage + Math.floor(playerStats.magic * 0.5) + (currentLevel - 1) * (skill.levelBonus || 0);
                battleState.playerBuffs.push({
                    type: 'shield',
                    amount: shieldAmount,
                    description: `${skill.name}护盾`
                });
                logMsg += ` 获得了${shieldAmount}点护盾！`;
                break;
                
            case SKILL_TYPE.BUFF:
                const buffAmount = skill.baseEffect + (currentLevel - 1) * (skill.levelBonus || 0);
                battleState.playerBuffs.push({
                    type: skill.effectType || 'attack',
                    amount: buffAmount,
                    duration: 3,
                    description: `${skill.name}效果`
                });
                logMsg += ` 效果已激活！`;
                break;
                
            case SKILL_TYPE.DEBUFF:
                const debuffAmount = skill.baseEffect + (currentLevel - 1) * (skill.levelBonus || 0);
                battleState.monsterDebuffs.push({
                    type: skill.effectType || 'defense',
                    amount: debuffAmount,
                    duration: 3,
                    description: `${skill.name}效果`
                });
                const debuffDamage = Math.floor(playerStats.attack * skill.baseDamage / 100);
                battleState.monsterHp = Math.max(0, battleState.monsterHp - debuffDamage);
                logMsg += ` 造成${debuffDamage}点伤害，并施加了负面效果！`;
                break;
                
            case SKILL_TYPE.SPECIAL:
                if (skill.effectType === 'escape') {
                    const escapeChance = skill.baseEffect + (currentLevel - 1) * (skill.levelBonus || 0);
                    if (Math.random() * 100 < escapeChance) {
                        addBattleLog('🎉 成功逃跑！');
                        closeBattle();
                        return;
                    } else {
                        logMsg += ' 逃跑失败！';
                    }
                } else {
                    logMsg += ' 特殊效果已触发！';
                }
                break;
        }
        
        addBattleLog(logMsg);
        petAttack();
        updateBattleUI();
        
        if (battleState.monsterHp <= 0) {
            battleWin();
        } else {
            battleState.isPlayerTurn = false;
            setTimeout(monsterTurn, 800);
        }
    }

    let battleState = {
        inBattle: false,
        currentFloor: 1,
        playerHp: 0,
        playerMaxHp: 0,
        playerAtk: 0,
        playerDef: 0,
        playerAtkSpeed: 1.0,
        playerMagic: 0,
        playerMaxMagic: 0,
        playerBuffs: [],
        monsterDebuffs: [],
        monsterHp: 0,
        monsterMaxHp: 0,
        monsterAtk: 0,
        monsterDef: 0,
        monsterAtkSpeed: 1.0,
        monsterName: '',
        monsterEmoji: '',
        monsterIsBoss: false,
        monsterIsElite: false,
        isDefending: false,
        isPlayerTurn: true,
        battleLog: [],
        canTame: true,
        activePets: []
    };

    function calculateDamage(attackerAtk, defenderDef, isDefending = false) {
        attackerAtk = isNaN(attackerAtk) || attackerAtk <= 0 ? 10 : attackerAtk;
        defenderDef = isNaN(defenderDef) || defenderDef < 0 ? 0 : defenderDef;
        
        let damage = Math.max(1, attackerAtk - defenderDef * 0.5);
        if (isDefending) {
            damage *= 0.5;
        }
        return Math.floor(damage);
    }

    function getFrostSlowEffect(floor) {
        const baseChance = 10;
        const baseDuration = 1.5;
        const zone = Math.floor(floor / 10);
        return {
            chance: baseChance + zone * 2,
            duration: baseDuration + zone * 0.2
        };
    }

    function addBattleLog(message) {
        battleState.battleLog.push(message);
        if (battleState.battleLog.length > 50) {
            battleState.battleLog.shift();
        }
    }

    function petAttack() {
        if (battleState.activePets.length === 0) return;

        for (const pet of battleState.activePets) {
            if (pet.hp <= 0) continue;

            const damageMultiplier = 0.8 + Math.random() * 0.4;
            const damage = Math.floor(pet.atk * damageMultiplier);

            battleState.monsterHp = Math.max(0, battleState.monsterHp - damage);
            addBattleLog(`🐾 ${pet.name}攻击了${battleState.monsterName}，造成了${damage}点伤害！`);

            if (battleState.monsterHp <= 0) {
                return;
            }
        }
    }

    function addGold(amount) {
        const userData = getCurrentUserData();
        if (!userData) return;
        userData.gold = (userData.gold || 0) + amount;
        userData.totalGoldEarned = (userData.totalGoldEarned || 0) + amount;
        saveAccounts();
    }

    function addDiamond(amount) {
        const userData = getCurrentUserData();
        if (!userData) return;
        userData.diamond = (userData.diamond || 0) + amount;
        userData.totalDiamondEarned = (userData.totalDiamondEarned || 0) + amount;
        saveAccounts();
    }

    function calculateDrops(floor, isBoss, isElite) {
        const baseGold = isBoss ? 500 : (isElite ? 200 : 50);
        const baseExp = isBoss ? 300 : (isElite ? 120 : 30);
        const goldMultiplier = Math.pow(1.2, Math.floor(floor / 10));
        const expMultiplier = Math.pow(1.15, Math.floor(floor / 10));
        const rareChance = isBoss ? 50 : (isElite ? 20 : 5);
        let diamond = 0;
        if (Math.random() * 100 < rareChance) {
            diamond = isBoss ? 20 : (isElite ? 5 : 1);
        }
        return {
            gold: Math.floor(baseGold * goldMultiplier * (0.8 + Math.random() * 0.4)),
            exp: Math.floor(baseExp * expMultiplier * (0.8 + Math.random() * 0.4)),
            diamond: diamond
        };
    }

    function saveDungeonProgress(floor) {
        const userData = getCurrentUserData();
        if (!userData) return;
        
        if (!userData.clearedFloors) {
            userData.clearedFloors = [];
        }
        
        if (!userData.clearedFloors.includes(floor)) {
            userData.clearedFloors.push(floor);
            userData.clearedFloors.sort((a, b) => a - b);
            saveAccounts();
        }
    }

    function updateBattleUI() {
        if (playerHpBar) {
            const hpPercent = (battleState.playerHp / battleState.playerMaxHp) * 100;
            playerHpBar.style.width = `${hpPercent}%`;
        }
        if (playerCurrentHp) playerCurrentHp.textContent = battleState.playerHp;
        if (playerMaxHp) playerMaxHp.textContent = battleState.playerMaxHp;

        if (playerMagicBar) {
            const magicPercent = (battleState.playerMagic / battleState.playerMaxMagic) * 100;
            playerMagicBar.style.width = `${magicPercent}%`;
        }
        if (playerCurrentMagic) playerCurrentMagic.textContent = battleState.playerMagic;
        if (playerMaxMagic) playerMaxMagic.textContent = battleState.playerMaxMagic;

        if (monsterHpBar) {
            const hpPercent = (battleState.monsterHp / battleState.monsterMaxHp) * 100;
            monsterHpBar.style.width = `${hpPercent}%`;
        }
        if (monsterCurrentHp) monsterCurrentHp.textContent = battleState.monsterHp;
        if (monsterMaxHp) monsterMaxHp.textContent = battleState.monsterMaxHp;

        if (monsterAtk) monsterAtk.textContent = battleState.monsterAtk;
        if (monsterDef) monsterDef.textContent = battleState.monsterDef;

        if (actionBtns) {
            actionBtns.forEach(btn => {
                btn.disabled = !battleState.isPlayerTurn;
            });
        }

        if (battleLog) {
            battleLog.innerHTML = battleState.battleLog.map(log => `<p>${log}</p>`).join('');
            battleLog.scrollTop = battleLog.scrollHeight;
        }

        updateBattlePetsDisplay();
    }

    function updateBattlePetsDisplay() {
        const battlePetsList = document.getElementById('battlePetsList');
        const battlePetsPanel = document.getElementById('battlePetsPanel');
        if (!battlePetsList || !battlePetsPanel) return;

        if (!battleState.activePets || battleState.activePets.length === 0) {
            battlePetsList.innerHTML = '<span style="font-size: 0.6rem; color: rgba(180, 210, 240, 0.5);">无</span>';
            return;
        }

        let html = '';
        for (const pet of battleState.activePets) {
            const hpPercent = pet.maxHp > 0 ? (pet.hp / pet.maxHp) * 100 : 0;
            const isDead = pet.hp <= 0;
            const hpClass = hpPercent < 30 ? 'low' : '';

            html += `<div class="battle-pet-item ${isDead ? 'dead' : ''}">
                <img class="battle-pet-avatar" src="../image/monster/${pet.img}" alt="${pet.name}">
                <span class="battle-pet-name">${pet.name}</span>
                <div class="battle-pet-hp-bar">
                    <div class="battle-pet-hp-fill ${hpClass}" style="width: ${hpPercent}%;"></div>
                </div>
                <span style="font-size: 0.5rem; color: rgba(180, 210, 240, 0.7);">${pet.hp}/${pet.maxHp}</span>
            </div>`;
        }
        battlePetsList.innerHTML = html;
    }

    function closeBattle() {
        if (battleModal) {
            battleModal.classList.remove('open');
        }
        battleState.inBattle = false;
    }

    function playerAttack() {
        if (!battleState.inBattle || !battleState.isPlayerTurn) return;

        battleState.isDefending = false;
        
        const userData = getCurrentUserData();
        let damage = calculateDamage(battleState.playerAtk, battleState.monsterDef, false);
        if (battleState.buffAttack) {
            damage = Math.floor(damage * (1 + battleState.buffAttack));
        }
        let logMsg = '';
        
        if (userData?.cheatKillOn) {
            damage = battleState.monsterHp;
            logMsg = `你发动了一击必杀！对${battleState.monsterName}造成了${damage}点伤害！`;
        } else {
            let isCrit = false;
            if (userData?.cheatHitOn) {
                isCrit = true;
            } else {
                const critChance = (battleState.playerCritRate || 0) / 100 + (battleState.buffCriticalRate || 0);
                if (Math.random() < critChance) {
                    isCrit = true;
                }
            }
            if (isCrit) {
                damage *= 2;
                logMsg = `你发动了暴击！对${battleState.monsterName}造成了${damage}点伤害！`;
                if (userData) {
                    userData.totalCrits = (userData.totalCrits || 0) + 1;
                }
            } else {
                logMsg = `你攻击了${battleState.monsterName}，造成了${damage}点伤害！`;
            }
        }
        
        battleState.monsterHp = Math.max(0, battleState.monsterHp - damage);

        addBattleLog(logMsg);

        petAttack();

        updateBattleUI();

        if (battleState.monsterHp <= 0) {
            battleWin();
        } else {
            battleState.isPlayerTurn = false;
            setTimeout(monsterTurn, 800);
        }
    }

    function playerDefend() {
        if (!battleState.inBattle || !battleState.isPlayerTurn) return;

        battleState.isDefending = true;
        addBattleLog('你进入防御姿态，下回合受到伤害减半！');

        petAttack();

        updateBattleUI();

        if (battleState.monsterHp <= 0) {
            battleWin();
        } else {
            battleState.isPlayerTurn = false;
            setTimeout(monsterTurn, 800);
        }
    }

    function monsterTurn() {
        if (!battleState.inBattle || battleState.monsterHp <= 0) return;
        
        let actualMonsterAtk = battleState.monsterAtk;
        let actualMonsterDef = battleState.monsterDef;
        
        battleState.monsterDebuffs.forEach(debuff => {
            if (debuff.type === 'defense_down' || debuff.type === 'defense') {
                actualMonsterDef *= (100 - debuff.amount) / 100;
            }
            if (debuff.type === 'atk_speed_down') {
                actualMonsterAtk *= (100 - debuff.amount) / 100;
            }
        });
        
        let playerDefBonus = 1;
        let playerAtkBonus = 1;
        battleState.playerBuffs.forEach(buff => {
            if (buff.type === 'defense_up' || buff.type === 'defense') {
                playerDefBonus += buff.amount / 100;
            }
            if (buff.type === 'attack_up' || buff.type === 'attack') {
                playerAtkBonus += buff.amount / 100;
            }
        });
        
        let playerDamage = calculateDamage(actualMonsterAtk, battleState.playerDef * playerDefBonus, battleState.isDefending);
        if (battleState.buffDefense) {
            playerDamage = Math.floor(playerDamage * (1 - battleState.buffDefense));
        }
        
        let shieldRemaining = 0;
        const shieldIndex = battleState.playerBuffs.findIndex(b => b.type === 'shield');
        if (shieldIndex !== -1) {
            shieldRemaining = battleState.playerBuffs[shieldIndex].amount;
            if (shieldRemaining > playerDamage) {
                battleState.playerBuffs[shieldIndex].amount -= playerDamage;
                addBattleLog(`${battleState.monsterName}攻击了你，护盾吸收了${playerDamage}点伤害！`);
                playerDamage = 0;
            } else {
                playerDamage -= shieldRemaining;
                addBattleLog(`${battleState.monsterName}攻击了你，护盾破裂！`);
                battleState.playerBuffs.splice(shieldIndex, 1);
            }
        }
        
        let logMsg = '';
        if (playerDamage > 0) {
            const userData = getCurrentUserData();
            if (userData?.cheatHpLock) {
                logMsg = `${battleState.monsterName}攻击了你，但被锁血效果抵挡！`;
            } else {
                battleState.playerHp = Math.max(0, battleState.playerHp - playerDamage);
                logMsg = `${battleState.monsterName}攻击了你，造成了${playerDamage}点伤害！`;
            }
        }

        const frost = getFrostSlowEffect(battleState.currentFloor);
        const slowApplied = Math.random() * 100 < frost.chance;

        if (slowApplied && playerDamage > 0) {
            logMsg += ` 并附带了${frost.duration}秒减速！`;
        }
        if (logMsg) {
            addBattleLog(logMsg);
        }

        if (battleState.activePets.length > 0 && Math.random() < 0.5) {
            const alivePets = battleState.activePets.filter(p => p.hp > 0);
            if (alivePets.length > 0) {
                const targetPet = alivePets[Math.floor(Math.random() * alivePets.length)];
                const petDamage = Math.floor(actualMonsterAtk * (0.3 + Math.random() * 0.2));
                targetPet.hp = Math.max(0, targetPet.hp - petDamage);
                addBattleLog(`🐾 ${targetPet.name}被${battleState.monsterName}攻击，受到了${petDamage}点伤害！`);

                if (targetPet.hp <= 0) {
                    addBattleLog(`💀 ${targetPet.name}阵亡了...`);
                }
            }
        }

        battleState.isDefending = false;
        
        battleState.playerBuffs = battleState.playerBuffs.filter(b => {
            if (b.duration) {
                b.duration--;
                return b.duration > 0;
            }
            return true;
        });
        
        battleState.monsterDebuffs = battleState.monsterDebuffs.filter(d => {
            if (d.duration) {
                d.duration--;
                return d.duration > 0;
            }
            return true;
        });

        if (battleState.playerHp <= 0) {
            battleLose();
        } else {
            const deadPetIds = battleState.activePets.filter(p => p.hp <= 0).map(p => p.id);
            if (deadPetIds.length > 0) {
                battleState.activePets = battleState.activePets.filter(p => p.hp > 0);
                const currentActiveIds = getActivePets().filter(id => !deadPetIds.includes(id));
                setActivePets(currentActiveIds);
            }

            battleState.isPlayerTurn = true;
            updateBattleUI();
        }
    }

    function battleWin(isTame) {
        battleState.inBattle = false;
        battleState.canTame = false;
        addBattleLog(`🎉 恭喜！你击败了${battleState.monsterName}！`);

        try {
            const userData = getCurrentUserData();
            if (userData) {
                userData.battleWins = (userData.battleWins || 0) + 1;
                
                const floor = battleState.currentFloor;
                if (battleState.monsterIsBoss && BOSS_MONSTERS[floor]) {
                    defeatMonster(floor, 'boss');
                } else if (battleState.monsterIsElite && ELITE_MONSTERS[floor]) {
                    defeatMonster(floor, 'elite');
                } else if (MONSTERS[floor]) {
                    defeatMonster(floor, 'normal');
                }
            }

            if (!isTame) {
                let drops;
                if (battleState.challengeMode === 'pvp') {
                    const playerLevel = getCurrentUserData()?.level || 1;
                    const aiLevel = battleState.monster?.level || playerLevel;
                    const levelDiff = Math.max(1, aiLevel - playerLevel + 1);
                    drops = {
                        exp: Math.floor(50 * levelDiff * (0.8 + Math.random() * 0.4)),
                        gold: Math.floor(100 * levelDiff * (0.8 + Math.random() * 0.4)),
                        diamond: Math.random() < 0.3 ? Math.floor(2 + Math.random() * 3) : 0
                    };
                } else {
                    drops = calculateDrops(battleState.currentFloor, battleState.monsterIsBoss, battleState.monsterIsElite);
                }

                addExp(drops.exp);
                addGold(drops.gold);
                if (drops.diamond > 0) {
                    addDiamond(drops.diamond);
                }

                addBattleLog(`获得经验: ${drops.exp}，金币: ${drops.gold}${drops.diamond > 0 ? '，钻石: ' + drops.diamond : ''}`);
            }

            if (battleState.challengeMode === 'endless') {
                handleEndlessVictory();
                return;
            } else if (battleState.challengeMode === 'pvp') {
                addBattleLog('🎉 PVP对战胜利！');
            } else {
                saveDungeonProgress(battleState.currentFloor);
            }
            
            checkAchievements();
            refreshVillageUI();
        } catch (e) {
            addBattleLog('⚠️ 结算奖励时出现异常');
        }

        if (battleState.challengeMode === 'bossEvolution') {
            handleBossEvolutionVictory(battleState.bossId, battleState.evoCount);
        }

        updateBattleUI();

        setTimeout(() => {
            closeBattle();
            if (battleState.challengeMode !== 'endless' && battleState.challengeMode !== 'bossEvolution' && battleState.challengeMode !== 'pvp') {
                openDungeon();
            }
        }, 2000);
    }

    function battleLose() {
        battleState.inBattle = false;
        battleState.canTame = false;
        addBattleLog('💀 你被击败了...');
        
        if (battleState.challengeMode === 'endless') {
            handleEndlessDefeat();
            addBattleLog('返回村庄...');
        } else {
            addBattleLog('返回地宫选择界面...');
        }
        
        updateBattleUI();

        setTimeout(() => {
            closeBattle();
        }, 1500);
    }

    function playerSkill() {
        if (!battleState.inBattle || !battleState.isPlayerTurn) return;
        openSkillSelect();
    }

    function renderPetInventory() {
        const petGrid = document.getElementById('petGrid');
        if (!petGrid) return;

        const pets = getUserPets();
        const activePetIds = getActivePets();

        let html = '';
        for (let i = 0; i < 60; i++) {
            if (i < pets.length) {
                const pet = pets[i];
                const rarityClass = getRarityClass(pet.rarity);
                const isActive = activePetIds.includes(pet.id);
                const activeMarker = isActive ? '⭐' : '';

                html += `<div class="pet-card ${rarityClass}" data-pet-id="${pet.id}">
                    <img class="pet-card-img" src="../image/monster/${pet.img}" alt="${pet.name}">
                    <span class="pet-card-name">${activeMarker}${pet.name}</span>
                </div>`;
            } else {
                html += `<div class="pet-card empty"></div>`;
            }
        }
        petGrid.innerHTML = html;
    }

    function sortPetInventory() {
        const userData = getCurrentUserData();
        if (!userData || !userData.pets) return;

        const rarityOrder = { red: 0, orange: 1, purple: 2, blue: 3, green: 4, white: 5 };

        userData.pets.sort((a, b) => {
            const rarA = rarityOrder[a.rarity] ?? 99;
            const rarB = rarityOrder[b.rarity] ?? 99;
            if (rarA !== rarB) return rarA - rarB;
            return (b.level || 1) - (a.level || 1);
        });

        saveAccounts();
        renderPetInventory();
        showMessage('宠物已整理！');
    }

    function togglePetReleaseMode() {
        petReleaseMode = !petReleaseMode;
        const releaseBtn = document.getElementById('petReleaseBtn');
        if (releaseBtn) {
            if (petReleaseMode) {
                releaseBtn.classList.add('active');
                releaseBtn.textContent = '🔄 取消放生';
                showMessage('点击宠物进行放生', 3000);
            } else {
                releaseBtn.classList.remove('active');
                releaseBtn.textContent = '🗑️ 放生';
            }
        }
    }

    function confirmReleasePet(petId) {
        const pets = getUserPets();
        const pet = pets.find(p => p.id === petId);
        if (!pet) return;

        if (confirm(`确定要放生 ${pet.name} 吗？放生后宠物将永久消失！`)) {
            releasePet(petId);
        }
    }

    function releasePet(petId) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.pets) return;

        const petIndex = userData.pets.findIndex(p => p.id === petId);
        if (petIndex === -1) return;

        const pet = userData.pets[petIndex];
        userData.pets.splice(petIndex, 1);

        const activePets = userData.activePets || [];
        const activeIndex = activePets.indexOf(petId);
        if (activeIndex !== -1) {
            activePets.splice(activeIndex, 1);
            userData.activePets = activePets;
        }

        saveAccounts();
        petReleaseMode = false;
        const releaseBtn = document.getElementById('petReleaseBtn');
        if (releaseBtn) {
            releaseBtn.classList.remove('active');
            releaseBtn.textContent = '🗑️ 放生';
        }
        showMessage(`已放生 ${pet.name}`);
        renderPetInventory();
        renderActivePets();
    }

    function getRarityClass(rarity) {
        switch (rarity) {
            case PET_RARITY.RARE: return 'rare';
            case PET_RARITY.EPIC: return 'epic';
            case PET_RARITY.LEGENDARY: return 'legendary';
            default: return 'common';
        }
    }

    function renderActivePets() {
        const slots = document.querySelectorAll('.pet-slot');
        const activePetIds = getActivePets();
        const allPets = getUserPets();

        slots.forEach((slot, index) => {
            if (activePetIds[index]) {
                const pet = allPets.find(p => p.id === activePetIds[index]);
                if (pet) {
                    slot.innerHTML = `<img class="active-pet-avatar" src="../image/monster/${pet.img}" alt="${pet.name}">`;
                    slot.classList.add('has-pet');
                    slot.dataset.petId = pet.id;
                }
            } else {
                slot.innerHTML = '';
                slot.classList.remove('has-pet');
                delete slot.dataset.petId;
            }
        });
    }

    function closePetInventory() {
        if (petModal) {
            petModal.classList.remove('open');
        }
        petReleaseMode = false;
        const releaseBtn = document.getElementById('petReleaseBtn');
        if (releaseBtn) {
            releaseBtn.classList.remove('active');
            releaseBtn.textContent = '🗑️ 放生';
        }
    }

    function togglePetActive(petId) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.activePets) {
            userData.activePets = [];
        }

        const index = userData.activePets.indexOf(petId);
        if (index !== -1) {
            userData.activePets.splice(index, 1);
            saveAccounts();
            renderPetInventory();
            renderActivePets();
        } else {
            if (userData.activePets.length >= 3) {
                return;
            }
            userData.activePets.push(petId);
            saveAccounts();
            renderPetInventory();
            renderActivePets();
        }
    }

    function openPetInventory() {
        if (petModal) {
            renderPetInventory();
            renderActivePets();
            petModal.classList.add('open');
        }
    }

    function playerSurrender() {
        if (!battleState.inBattle) return;

        battleState.inBattle = false;
        addBattleLog('你选择了投降...');
        addBattleLog('没有获得任何奖励');
        updateBattleUI();

        setTimeout(() => {
            closeBattle();
        }, 1000);
    }

    function playerTame() {
        if (!battleState.inBattle || !battleState.isPlayerTurn) return;

        if (battleState.monsterIsBoss) {
            addBattleLog('❌ BOSS无法被驯服！');
            updateBattleUI();
            battleState.isPlayerTurn = false;
            setTimeout(monsterTurn, 800);
            return;
        }

        if (!battleState.canTame) {
            addBattleLog('❌ 本次战斗已经使用过驯服！');
            updateBattleUI();
            battleState.isPlayerTurn = false;
            setTimeout(monsterTurn, 800);
            return;
        }

        let tameChance = 0;
        if (battleState.monsterIsElite) {
            tameChance = 0.03;
        } else {
            tameChance = 0.05;
        }

        battleState.canTame = false;

        addBattleLog('🦊 你使用了凌驾（驯服）！');

        if (Math.random() < tameChance) {
            const pet = createPetFromMonster(battleState.monsterName, battleState.monsterImg);

            if (isPetInventoryFull()) {
                addBattleLog('❌ 宠物背包已满，无法容纳新宠物！');
                updateBattleUI();
                battleState.isPlayerTurn = false;
                setTimeout(monsterTurn, 800);
                return;
            }

            addPetToInventory(pet);
            const userData = getCurrentUserData();
            if (userData) {
                userData.hasTamed = true;
                saveAccounts();
                checkAchievements();
            }
            addBattleLog(`🎉 驯服成功！获得了${pet.rarity}级宠物「${pet.name}」！`);

            battleState.monsterHp = 0;
            updateBattleUI();

            setTimeout(() => {
                battleWin(true);
            }, 1000);
        } else {
            addBattleLog(`😢 驯服失败...${battleState.monsterName}挣脱了！`);
            updateBattleUI();
            battleState.isPlayerTurn = false;
            setTimeout(monsterTurn, 800);
        }
    }

    // ========== 图鉴功能 ==========

    let codexModal, codexBody;
    let codexInitialized = false;

    function openCodex() {
        codexModal = document.getElementById('codexModal');
        codexBody = document.getElementById('codexBody');
        if (!codexModal) return;

        codexModal.style.display = 'flex';
        renderCodex('equipment');

        const closeBtn = document.getElementById('codexClose');
        const backdrop = codexModal.querySelector('.codex-backdrop');
        closeBtn?.addEventListener('click', closeCodex);
        backdrop?.addEventListener('click', closeCodex);

        if (!codexInitialized) {
            const tabs = codexModal.querySelectorAll('.codex-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const tabName = tab.dataset.codexTab;
                    renderCodex(tabName);
                });
            });
            codexInitialized = true;
        }
    }

    function closeCodex() {
        const codexModal = document.getElementById('codexModal');
        if (codexModal) {
            codexModal.style.display = 'none';
        }
    }

    let giftModal;

    function openGift() {
        giftModal = document.getElementById('giftModal');
        if (!giftModal) return;

        giftModal.style.display = 'flex';
        renderGiftPacks();

        const closeBtn = document.getElementById('giftClose');
        const backdrop = giftModal.querySelector('.gift-backdrop');
        closeBtn?.addEventListener('click', closeGift);
        backdrop?.addEventListener('click', closeGift);
    }

    function closeGift() {
        if (giftModal) {
            giftModal.style.display = 'none';
        }
    }

    let redeemModal, redeemInput;
    let consoleModal, consoleInput, consoleHistory;

    function openRedeem() {
        redeemModal = document.getElementById('redeemModal');
        redeemInput = document.getElementById('redeemInput');
        if (!redeemModal) return;

        redeemModal.style.display = 'flex';
        if (redeemInput) redeemInput.value = '';

        const closeBtn = document.getElementById('redeemClose');
        const backdrop = redeemModal.querySelector('.redeem-backdrop');
        closeBtn?.addEventListener('click', closeRedeem);
        backdrop?.addEventListener('click', closeRedeem);

        const redeemBtn = document.getElementById('redeemBtn');
        redeemBtn?.addEventListener('click', handleRedeem);

        if (redeemInput) {
            redeemInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleRedeem();
            });
        }
    }

    function closeRedeem() {
        if (redeemModal) {
            redeemModal.style.display = 'none';
        }
    }

    function handleRedeem() {
        const code = redeemInput?.value?.trim();
        if (!code) return;

        if (code === 'master-id-yocim888') {
            closeRedeem();
            setTimeout(() => openConsole(), 100);
        } else {
            showMessage('兑换码错误！');
        }
    }

    function openConsole() {
        consoleModal = document.getElementById('consoleModal');
        consoleInput = document.getElementById('consoleInput');
        consoleHistory = document.getElementById('consoleHistory');
        if (!consoleModal) return;

        consoleModal.style.display = 'flex';
        if (consoleHistory) {
            consoleHistory.innerHTML = '<div class="console-welcome">欢迎使用作弊控制台！输入 /help 查看帮助</div>';
        }
        if (consoleInput) consoleInput.value = '';

        const closeBtn = document.getElementById('consoleClose');
        const backdrop = consoleModal.querySelector('.console-backdrop');
        closeBtn?.addEventListener('click', closeConsole);
        backdrop?.addEventListener('click', closeConsole);

        if (consoleInput) {
            consoleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') executeCommand();
            });
        }

        if (consoleInput) consoleInput.focus();
    }

    function closeConsole() {
        if (consoleModal) {
            consoleModal.style.display = 'none';
        }
    }

    function addConsoleLine(text, type = '') {
        if (!consoleHistory) return;
        const line = document.createElement('div');
        line.className = 'console-line ' + type;
        line.textContent = text;
        consoleHistory.appendChild(line);
        consoleHistory.scrollTop = consoleHistory.scrollHeight;
    }

    function executeCommand() {
        if (!consoleInput) return;
        const cmd = consoleInput.value.trim();
        if (!cmd) return;

        addConsoleLine('> ' + cmd, '');
        consoleInput.value = '';

        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        const userData = getCurrentUserData();
        if (!userData) {
            addConsoleLine('错误：未登录', 'error');
            return;
        }

        switch (command) {
            case '/help':
                addConsoleLine('=== 可用指令 ===', 'info');
                addConsoleLine('/add gold/diamond/exp/coin [数量] - 增加资源', '');
                addConsoleLine('/lock hp/mp - 锁定生命/魔力', '');
                addConsoleLine('/clean lock - 解除所有锁定', '');
                addConsoleLine('/hit on/off - 必定暴击开关', '');
                addConsoleLine('/kill on/off - 一击必杀开关', '');
                addConsoleLine('/get op scroll/item - 获得OP物品', '');
                addConsoleLine('/get newplayer item - 获取新手六件套', '');
                break;

            case '/add':
                if (args.length < 2) {
                    addConsoleLine('用法：/add gold/diamond/exp/coin [数量]', 'error');
                    return;
                }
                const amount = parseInt(args[1]);
                if (isNaN(amount) || amount <= 0) {
                    addConsoleLine('数量必须是正整数', 'error');
                    return;
                }
                switch (args[0].toLowerCase()) {
                    case 'gold':
                        userData.gold = (userData.gold || 0) + amount;
                        addConsoleLine(`成功增加 ${amount} 金币！当前：${userData.gold}`, 'success');
                        break;
                    case 'diamond':
                        userData.diamond = (userData.diamond || 0) + amount;
                        addConsoleLine(`成功增加 ${amount} 钻石！当前：${userData.diamond}`, 'success');
                        break;
                    case 'exp':
                        addExp(amount);
                        addConsoleLine(`成功增加 ${amount} 经验！当前：${userData.exp}`, 'success');
                        break;
                    case 'coin':
                    case 'cion':
                        if (!userData.items) userData.items = {};
                        userData.items.evolutionCoin = (userData.items.evolutionCoin || 0) + amount;
                        addConsoleLine(`成功增加 ${amount} 进化币！当前：${userData.items.evolutionCoin}`, 'success');
                        break;
                    default:
                        addConsoleLine('未知资源类型，可用：gold/diamond/exp/coin', 'error');
                }
                saveAccounts();
                break;

            case '/lock':
                if (args.length < 1) {
                    addConsoleLine('用法：/lock hp/mp', 'error');
                    return;
                }
                switch (args[0].toLowerCase()) {
                    case 'hp':
                        userData.cheatHpLock = true;
                        addConsoleLine('生命锁定已开启！', 'success');
                        break;
                    case 'mp':
                        userData.cheatMpLock = true;
                        addConsoleLine('魔力锁定已开启！', 'success');
                        break;
                    default:
                        addConsoleLine('未知锁定类型，可用：hp/mp', 'error');
                }
                saveAccounts();
                break;

            case '/clean':
                if (args[0]?.toLowerCase() === 'lock') {
                    userData.cheatHpLock = false;
                    userData.cheatMpLock = false;
                    userData.cheatHitOn = false;
                    userData.cheatKillOn = false;
                    addConsoleLine('所有锁定和作弊状态已清除！', 'success');
                    saveAccounts();
                } else {
                    addConsoleLine('用法：/clean lock', 'error');
                }
                break;

            case '/hit':
                if (args.length < 1) {
                    addConsoleLine('用法：/hit on/off', 'error');
                    return;
                }
                if (args[0].toLowerCase() === 'on') {
                    userData.cheatHitOn = true;
                    addConsoleLine('必定暴击已开启！', 'success');
                } else if (args[0].toLowerCase() === 'off') {
                    userData.cheatHitOn = false;
                    addConsoleLine('必定暴击已关闭！', 'success');
                } else {
                    addConsoleLine('用法：/hit on/off', 'error');
                }
                saveAccounts();
                break;

            case '/kill':
                if (args.length < 1) {
                    addConsoleLine('用法：/kill on/off', 'error');
                    return;
                }
                if (args[0].toLowerCase() === 'on') {
                    userData.cheatKillOn = true;
                    addConsoleLine('一击必杀已开启！', 'success');
                } else if (args[0].toLowerCase() === 'off') {
                    userData.cheatKillOn = false;
                    addConsoleLine('一击必杀已关闭！', 'success');
                } else {
                    addConsoleLine('用法：/kill on/off', 'error');
                }
                saveAccounts();
                break;

            case '/get':
                if (args.length < 2) {
                    addConsoleLine('用法：/get op scroll/item 或 /get newplayer item', 'error');
                    return;
                }
                if (args[0].toLowerCase() === 'op') {
                    switch (args[1].toLowerCase()) {
                        case 'scroll':
                            addItemToBackpack('创世契约', 1);
                            addConsoleLine('成功获得创世契约 x1！', 'success');
                            saveAccounts();
                            break;
                        case 'item':
                            addEquipmentToBackpack('创世神剑');
                            addEquipmentToBackpack('创世神盔');
                            addEquipmentToBackpack('创世神袍');
                            addEquipmentToBackpack('创世神裤');
                            addEquipmentToBackpack('创世神靴');
                            addEquipmentToBackpack('创世神戒');
                            addConsoleLine('成功获得创世六件套！', 'success');
                            saveAccounts();
                            break;
                        default:
                            addConsoleLine('未知物品，可用：scroll/item', 'error');
                    }
                } else if (args[0].toLowerCase() === 'newplayer' && args[1]?.toLowerCase() === 'item') {
                    const newbieEquips = ['新手铁剑', '新手草帽', '新手上衣', '新手裤子', '新手靴子', '新手护符'];
                    newbieEquips.forEach(name => addEquipmentToBackpack(name));
                    addConsoleLine('✅ 获得新手六件套！', 'success');
                    saveAccounts();
                } else {
                    addConsoleLine('用法：/get op scroll/item 或 /get newplayer item', 'error');
                }
                break;

            default:
                addConsoleLine('未知指令，输入 /help 查看帮助', 'error');
        }

        renderBackpackItems();
        updateShopCurrency();
    }

    function renderGiftPacks() {
        const giftBody = document.getElementById('giftBody');
        if (!giftBody) return;

        const userData = getCurrentUserData();
        if (!userData) return;

        let html = '';

        Object.values(GIFTPACKS).forEach(pack => {
            let canBuy = true;
            let btnText = '购买';
            let btnClass = 'buy';
            let btnDisabled = '';

            if (pack.id === 'starter') {
                if (userData.receivedStarterPack) {
                    btnText = '已领取';
                    btnClass = 'claimed';
                    btnDisabled = 'disabled';
                    canBuy = false;
                } else {
                    btnText = '免费领取';
                    btnClass = 'claim';
                }
            } else {
                if (pack.currency === 'diamond' && userData.diamond < pack.price) {
                    btnDisabled = 'disabled';
                }
            }

            const priceText = pack.currency === 'free' ? '免费' : (pack.currency === 'diamond' ? `💎 ${pack.price}` : `💰 ${pack.price}`);
            const priceClass = pack.currency === 'free' ? 'free' : '';

            const limitText = pack.limit === 1 ? '限购一次' : (pack.limit ? `限购${pack.limit}次` : '不限购');

            const itemsText = pack.items.map(item => {
                if (item.type === 'equipment') {
                    return item.name;
                } else {
                    return `${item.name}x${item.quantity}`;
                }
            }).join('、');

            html += `
                <div class="gift-card" data-pack-id="${pack.id}">
                    <div class="gift-card-header">
                        <span class="gift-card-title">${pack.name}</span>
                        <span class="gift-card-price ${priceClass}">${priceText}</span>
                    </div>
                    <div class="gift-card-desc">${pack.desc}</div>
                    <div class="gift-card-items">${itemsText}</div>
                    <button class="gift-card-btn ${btnClass}" ${btnDisabled} data-pack-id="${pack.id}">${btnText}</button>
                    ${pack.limit ? `<div class="gift-card-limit">${limitText}</div>` : ''}
                </div>
            `;
        });

        giftBody.innerHTML = html;

        const btns = giftBody.querySelectorAll('.gift-card-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const packId = btn.dataset.packId;
                if (packId === 'starter') {
                    claimStarterPack();
                } else {
                    purchaseGiftPack(packId);
                }
            });
        });
    }

    function claimStarterPack() {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (userData.receivedStarterPack) {
            showMessage('新手礼包已领取过！');
            return;
        }

        const pack = GIFTPACKS.starter;
        if (!pack) return;

        pack.items.forEach(item => {
            if (item.type === 'equipment') {
                addEquipmentToBackpack(item.name);
            } else if (item.type === 'item') {
                addItemToBackpack(item.name, item.quantity);
            }
        });

        userData.receivedStarterPack = true;
        saveAccounts();
        renderGiftPacks();
        showMessage('恭喜获得新手礼包！');
    }

    function purchaseGiftPack(packId) {
        const userData = getCurrentUserData();
        if (!userData) return;

        const pack = GIFTPACKS[packId];
        if (!pack) return;

        if (pack.currency === 'diamond' && userData.diamond < pack.price) {
            showMessage('钻石不足！');
            return;
        }

        userData.diamond -= pack.price;

        pack.items.forEach(item => {
            if (item.type === 'item') {
                addItemToBackpack(item.name, item.quantity);
            }
        });

        if (pack.id === 'scroll') {
            userData.purchasedScrollPack = (userData.purchasedScrollPack || 0) + 1;
        } else if (pack.id === 'exp') {
            userData.purchasedExpPack = (userData.purchasedExpPack || 0) + 1;
        } else if (pack.id === 'tame') {
            userData.purchasedTamePack = (userData.purchasedTamePack || 0) + 1;
        }

        saveAccounts();
        updateShopCurrency();
        renderGiftPacks();
        showMessage(`恭喜获得${pack.name}！`);
    }

    function addEquipmentToBackpack(equipName) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.backpackItems) userData.backpackItems = [];

        let slotIndex = 0;
        for (let i = 0; i < 60; i++) {
            const hasSlot = userData.backpackItems.some(bi => bi.slot === i);
            if (!hasSlot) {
                slotIndex = i;
                break;
            }
        }

        const equip = EQUIPMENT[equipName];
        if (!equip) return;

        userData.backpackItems.push({
            id: 'equip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: equipName,
            icon: null,
            type: 'equipment',
            rarity: equip.rarity,
            equipType: equip.type,
            level: 0,
            props: { ...equip.props },
            growth: { ...equip.growth },
            slot: slotIndex,
            quantity: 1
        });

        collectEquipment(equipName);
    }

    function addItemToBackpack(itemName, quantity) {
        const userData = getCurrentUserData();
        if (!userData) return;

        if (!userData.backpackItems) userData.backpackItems = [];

        const existingItem = userData.backpackItems.find(bi => bi.name === itemName && bi.type === 'consumable');
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + quantity;
        } else {
            let slotIndex = 0;
            for (let i = 0; i < 60; i++) {
                const hasSlot = userData.backpackItems.some(bi => bi.slot === i);
                if (!hasSlot) {
                    slotIndex = i;
                    break;
                }
            }

            const itemData = ITEMS[itemName];
            userData.backpackItems.push({
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: itemName,
                icon: itemData?.icon || '📦',
                type: 'consumable',
                itemType: itemData?.type || 'other',
                effect: itemData?.effect,
                slot: slotIndex,
                quantity: quantity || 1
            });

            collectItem(itemName);
        }
    }

    function renderCodex(tab) {
        const userData = getCurrentUserData();
        if (!userData) return;

        switch (tab) {
            case 'equipment':
                renderEquipmentCodex(userData);
                break;
            case 'item':
                renderItemCodex(userData);
                break;
            case 'monster':
                renderMonsterCodex(userData);
                break;
            case 'achievement':
                renderAchievementCodex(userData);
                break;
        }
    }

    function renderEquipmentCodex(userData) {
        const collected = userData.collectedEquipment || [];
        let html = '<div class="codex-section-title">装备图鉴</div>';
        html += `<div class="codex-progress">已收集: ${collected.length} / ${Object.keys(EQUIPMENT).length}</div>`;
        html += '<div class="codex-grid">';

        Object.entries(EQUIPMENT).forEach(([name, equip]) => {
            const isCollected = collected.includes(name);
            const rarityClass = equip.rarity === EQUIPMENT_RARITY.RED ? 'legendary' :
                               equip.rarity === EQUIPMENT_RARITY.ORANGE ? 'epic' :
                               equip.rarity === EQUIPMENT_RARITY.PURPLE ? 'rare' : 'common';
            html += `
                <div class="codex-card ${isCollected ? '' : 'locked'} ${rarityClass}">
                    <div class="codex-icon">⚔️</div>
                    <div class="codex-name">${isCollected ? name : '???'}</div>
                    <div class="codex-desc">${isCollected ? equip.type : '未收集'}</div>
                </div>
            `;
        });

        html += '</div>';
        codexBody.innerHTML = html;
    }

    function renderItemCodex(userData) {
        const collected = userData.collectedItems || [];
        let html = '<div class="codex-section-title">道具图鉴</div>';
        html += `<div class="codex-progress">已收集: ${collected.length} / ${Object.keys(ITEMS).length}</div>`;
        html += '<div class="codex-grid">';

        Object.entries(ITEMS).forEach(([name, item]) => {
            const isCollected = collected.includes(name);
            html += `
                <div class="codex-card ${isCollected ? '' : 'locked'}">
                    <div class="codex-icon">${item.icon}</div>
                    <div class="codex-name">${isCollected ? name : '???'}</div>
                    <div class="codex-desc">${isCollected ? item.desc : '未收集'}</div>
                </div>
            `;
        });

        html += '</div>';
        codexBody.innerHTML = html;
    }

    function renderMonsterCodex(userData) {
        const defeated = userData.defeatedMonsters || { normals: [], elites: [], bosses: [] };
        let html = '<div class="codex-section-title">怪物图鉴</div>';

        const totalMonsters = Object.keys(MONSTERS).length + Object.keys(ELITE_MONSTERS).length + Object.keys(BOSS_MONSTERS).length;
        const totalDefeated = defeated.normals.length + defeated.elites.length + defeated.bosses.length;
        html += `<div class="codex-progress">已击败: ${totalDefeated} / ${totalMonsters}</div>`;

        html += '<div class="codex-monster-category">';
        html += '<div class="codex-category-title">普通怪物</div>';
        html += '<div class="codex-grid">';
        Object.entries(MONSTERS).forEach(([id, monster]) => {
            const isDefeated = defeated.normals.includes(Number(id));
            html += `
                <div class="codex-card ${isDefeated ? '' : 'locked'}">
                    <img class="codex-monster-img" src="${isDefeated ? '../image/monster/' + monster.img : ''}" alt="${monster.name}">
                    <div class="codex-name">${isDefeated ? monster.name : '???'}</div>
                    <div class="codex-desc">第${id}层</div>
                </div>
            `;
        });
        html += '</div>';

        html += '<div class="codex-category-title">精英怪物</div>';
        html += '<div class="codex-grid">';
        Object.entries(ELITE_MONSTERS).forEach(([id, monster]) => {
            const isDefeated = defeated.elites.includes(Number(id));
            html += `
                <div class="codex-card ${isDefeated ? '' : 'locked'} elite">
                    <img class="codex-monster-img" src="${isDefeated ? '../image/monster/' + monster.img : ''}" alt="${monster.name}">
                    <div class="codex-name">${isDefeated ? monster.name : '???'}</div>
                    <div class="codex-desc">第${id}层</div>
                </div>
            `;
        });
        html += '</div>';

        html += '<div class="codex-category-title">BOSS</div>';
        html += '<div class="codex-grid">';
        Object.entries(BOSS_MONSTERS).forEach(([id, monster]) => {
            const isDefeated = defeated.bosses.includes(Number(id));
            html += `
                <div class="codex-card ${isDefeated ? '' : 'locked'} boss">
                    <img class="codex-monster-img" src="${isDefeated ? '../image/monster/' + monster.img : ''}" alt="${monster.name}">
                    <div class="codex-name">${isDefeated ? monster.name : '???'}</div>
                    <div class="codex-desc">第${id}层</div>
                </div>
            `;
        });
        html += '</div>';
        html += '</div>';

        codexBody.innerHTML = html;
    }

    function renderAchievementCodex(userData) {
        const unlocked = userData.achievements || {};
        let html = '<div class="codex-section-title">成就图鉴</div>';
        const unlockedCount = Object.values(unlocked).filter(u => u).length;
        const totalCount = Object.keys(ACHIEVEMENT_DEFS).length;
        html += `<div class="codex-progress">已解锁: ${unlockedCount} / ${totalCount}</div>`;

        const categories = {};
        Object.entries(ACHIEVEMENT_DEFS).forEach(([id, ach]) => {
            if (!categories[ach.category]) categories[ach.category] = [];
            categories[ach.category].push({ id, ...ach });
        });

        Object.entries(categories).forEach(([cat, achs]) => {
            html += `<div class="codex-category-title">${cat}</div>`;
            html += '<div class="codex-grid">';
            achs.forEach(ach => {
                const isUnlocked = unlocked[ach.id];
                html += `
                    <div class="codex-card achievement ${isUnlocked ? '' : 'locked'}">
                        <div class="codex-icon">${ach.icon}</div>
                        <div class="codex-name">${ach.name}</div>
                        <div class="codex-desc">${ach.desc}</div>
                        ${isUnlocked ? '<div class="codex-unlocked">✓ 已解锁</div>' : ''}
                    </div>
                `;
            });
            html += '</div>';
        });

        codexBody.innerHTML = html;
    }

    function collectEquipment(equipName) {
        const userData = getCurrentUserData();
        if (!userData) return;
        if (!userData.collectedEquipment) userData.collectedEquipment = [];
        if (!userData.collectedEquipment.includes(equipName)) {
            userData.collectedEquipment.push(equipName);
            saveAccounts();
            checkAchievements();
        }
    }

    function collectItem(itemName) {
        const userData = getCurrentUserData();
        if (!userData) return;
        if (!userData.collectedItems) userData.collectedItems = [];
        if (!userData.collectedItems.includes(itemName)) {
            userData.collectedItems.push(itemName);
            saveAccounts();
            checkAchievements();
        }
    }

    function defeatMonster(monsterId, type) {
        const userData = getCurrentUserData();
        if (!userData) return;
        if (!userData.defeatedMonsters) userData.defeatedMonsters = { normals: [], elites: [], bosses: [] };

        let arr;
        if (type === 'boss') arr = userData.defeatedMonsters.bosses;
        else if (type === 'elite') arr = userData.defeatedMonsters.elites;
        else arr = userData.defeatedMonsters.normals;

        if (!arr.includes(monsterId)) {
            arr.push(monsterId);
            saveAccounts();
            checkAchievements();
        }
    }

    function checkAchievements() {
        const userData = getCurrentUserData();
        if (!userData) return;
        if (!userData.achievements) userData.achievements = {};

        let unlocked = false;
        Object.entries(ACHIEVEMENT_DEFS).forEach(([id, ach]) => {
            if (!userData.achievements[id] && ach.check(userData)) {
                userData.achievements[id] = true;
                unlocked = true;
                showMessage(`🎉 解锁成就: ${ach.name}!`);
            }
        });

        if (unlocked) saveAccounts();
    }

    function initUserDataCodex(userData) {
        if (!userData.collectedEquipment) userData.collectedEquipment = [];
        if (!userData.collectedItems) userData.collectedItems = [];
        if (!userData.defeatedMonsters) userData.defeatedMonsters = { normals: [], elites: [], bosses: [] };
        if (!userData.achievements) userData.achievements = {};
        if (!userData.battleWins) userData.battleWins = 0;
        if (!userData.totalGoldEarned) userData.totalGoldEarned = 0;
        if (!userData.totalDiamondEarned) userData.totalDiamondEarned = 0;
        if (!userData.totalCrits) userData.totalCrits = 0;
        if (!userData.hasTamed) userData.hasTamed = false;
    }

    document.addEventListener('DOMContentLoaded', init);
})();
