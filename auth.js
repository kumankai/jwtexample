const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(express.json());

const posts = [
    {
        username: 'Bruh',
        title: 'Post 1'
    },
    {
        username: 'Jacob',
        title: 'Post 2'
    }
]

let refreshTokens = []

app.post('/token', (req, res) => {
    // Generate a new accesstoken with a refreshtoken
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken( { name: user.name });
        res.json({ accessToken: accessToken });
    })
})


app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204);
})

app.post('/login', (req, res) => {
    // Generate an accesstoken and refreshtoken
    const username = req.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

app.listen(4000);