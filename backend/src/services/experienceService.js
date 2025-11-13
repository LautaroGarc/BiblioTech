const UserModel = require('../models/users');

const XP_REWARDS = {
    RETURN_ITEM: 50,
    FORUM_MESSAGE: 15
};

const BASE_LEVEL_XP = 100;
const LEVEL_STEP_XP = 50;

function getXpThreshold(level = 1) {
    const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
    return BASE_LEVEL_XP + (safeLevel - 1) * LEVEL_STEP_XP;
}

async function awardExperience(userId, amount, metadata = {}) {
    if (!userId || !Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    const user = await UserModel.getUser(userId);

    if (!user) {
        console.warn(`[XP] Usuario ${userId} no encontrado. No se otorga experiencia.`);
        return null;
    }

    let currentXp = Number(user.xp) || 0;
    let currentLevel = Number(user.lvl) || 1;
    let totalXp = currentXp + amount;
    let levelsGained = 0;
    let threshold = getXpThreshold(currentLevel);

    while (totalXp >= threshold) {
        totalXp -= threshold;
        currentLevel += 1;
        levelsGained += 1;
        threshold = getXpThreshold(currentLevel);
    }

    await UserModel.updateExperience(userId, totalXp, currentLevel);

    return {
        userId,
        awardedXp: amount,
        xp: totalXp,
        level: currentLevel,
        leveledUp: levelsGained > 0,
        levelsGained,
        nextLevelXp: threshold,
        metadata
    };
}

module.exports = {
    XP_REWARDS,
    BASE_LEVEL_XP,
    LEVEL_STEP_XP,
    getXpThreshold,
    awardExperience
};
