export function getHiveAvatarUrl(userName?: string): string {
    if (userName) {
        return `https://images.hive.blog/u/${userName}/avatar`;
    } else {
        return "";
    }

};