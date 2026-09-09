import Settings from "../models/settings.js"; 

export const getSettings = async () => {
    return Settings.findOneAndUpdate(
        { singleton: "global" }, 
        { $setOnInsert: { singleton : "global"} },
        { upsert: true, new: true } 
    );
};

export const updateSettings = async (updates) => {
    return Settings.findOneAndUpdate(
        { singleton: "global" },
        { $set: update },
        { upsert: true, new: true, runValidators: true }
    );
};