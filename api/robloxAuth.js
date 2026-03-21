export default function handler(req, res) {
    const params = new URLSearchParams({
        client_id: process.env.ROBLOX_CLIENT_ID,
        redirect_uri: "https://nca-rggrp.vercel.app/api/robloxCallback",
        response_type: "code",
        scope: "openid profile",
    });
    res.redirect(`https://apis.roblox.com/oauth/v1/authorize?${params}`);
}
