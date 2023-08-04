var UserController = require('../Controller/UserController');
module.exports = function(app)
{
     
    const fs = require('fs');


    // app.get('/highscore', (req, res) => {
    //     res.status(200).json(highscores);
    // });

    // app.post('/highscore', (req, res) => {
    //     const newScore = req.body;

    //     for (let user in newScore) {
    //         if (Number.isInteger(newScore[user])) {
    //             if (!(highscores[user] > newScore[user])) highscores[user] = newScore[user];
    //         }

    //         else {
    //             res.status(400).json({ message: 'The score for ' + user + ' is not an Integer' });
    //             return;
    //         }
    //     }

    //     const json = JSON.stringify(highscores);
    //     fs.writeFile("../resources/highscores.json", json, (err) => {
    //         if (err) throw err;
    //     }
    //     );
    //     res.status(200).json({ message: 'Data has been successfully added' });
    // });

    // app.get('/words', (req, res) => {
    //     res.status(200).json(words);
    // });

    // app.put('/add-word', (req, res) => {
    //     const wordArray = req.body;
    //     // Check if data is an array
    //     if (!Array.isArray(wordArray)) {
    //         res.status(400).json({ message: 'Data must be a JSON array' });
    //         return;
    //     }

    //     var addedWords = [];
    //     var badWords = [];


    //     for (let newWord in wordArray) {
    //         // Check if data is in String format
    //         if (!isNaN(wordArray[newWord])) {
    //             console.log(wordArray[newWord] + 'is an invalid input');
    //             badWords.push(wordArray[newWord]);
    //         }
    //         else {

    //             var isDuplicate = false;

    //             // Check if word already exists
    //             for (let existingWord in words) {
    //                 if (words[existingWord] === wordArray[newWord]) isDuplicate = true;
    //             }

    //             // If not a duplicate, add it to the array
    //             if (isDuplicate) {
    //                 console.log(wordArray[newWord] + ' is a duplicate');
    //                 badWords.push(wordArray[newWord]);
    //             }
    //             else {

    //                 words.push(wordArray[newWord]);
    //                 addedWords.push(wordArray[newWord]);
    //                 const json = JSON.stringify(words);
    //                 fs.writeFile("./resources/words.json", json, (err) => {
    //                     if (err) throw err;
    //                 }
    //                 );
    //             }
    //         }
    //     }

    //     if (badWords.length > 0) {
    //         if (addedWords.length > 0)
    //             res.status(400).json({ message: `Duplicate/Invalid inputs found: "${badWords}".\n"${addedWords}" successfully added.` });
    //         else
    //             res.status(400).json({ message: `Duplicate/Invalid inputs found: "${badWords}".` });
    //     }
    //     else
    //         res.status(200).json({ message: `"${addedWords}" successfully added.` })
    // });



    app.post('/user/login',UserController.LogIn);
    app.post('/user/signup',UserController.Create);
    // app.get('/user/read',UserController.Read);
    // app.post('/user/read/id',UserController.ReadById);
    // app.post('/user/update',UserController.Update);
    // app.post('/user/delete',UserController.Delete);


}