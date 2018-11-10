const puppeteer = require('puppeteer')
const randomWords = require('random-words');
const colleges = require('./credential.json');
const parallel = 1;

const tweeeets = async(colleges, parallel) => {
    const parallelBatches = Math.ceil(colleges.length / parallel)

    console.log('\nI have gotten the task of taking screenshots of ' + colleges.length + ' Wikipedia articles on colleges in Cologne and will take ' + parallel + ' of them in paralell.')

    console.log(' This will result in ' + parallelBatches + ' batches.')


    let k = 0
    for (let i = 0; i < colleges.length; i += parallel) {
        k++
        console.log('\nBatch ' + k + ' of ' + parallelBatches)
        const browser = await puppeteer.launch({ headless: false });
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        page.setJavaScriptEnabled(false)

        const promises = []
        for (let j = 0; j < parallel; j++) {
            let elem = i + j
            if (colleges[elem] != undefined) {
                console.log('🖖 I promise to screenshot: ' + colleges[elem].username)
                promises.push(browser.newPage({
                    devtools: true,
                    openInExistingWindow: true
                }).then(async page => {
                    await page.setViewport({ width: 1280, height: 800 })
                    try {
                        // Only create screenshot if page.goto get's no error
                        await page.goto('https://twitter.com/login')
                        await page.type('.js-username-field', colleges[elem].username, { delay: 100 })
                        await page.type('.js-password-field', colleges[elem].password)

                        .then(async() => {
                                const btn = await page.click('button[type="submit"]');
                            })
                            .catch(err =>
                                console.log(err)

                            )

                        await page.waitFor(3000)
                        await page.type('#tweet-box-home-timeline', "Pakistan ki shan #ImranKhan Fan 03 " + randomWords() + ' ' + randomWords())


                        let tweet_btn = await page.$('.tweet-action');
                        tweet_btn.click()

                        await page.waitFor(2000)
                        let large_view_tweet = await page.$$('.js-tweet-text');
                        large_view_tweet[0].click()



                        let texts = await page.evaluate(() => {
                            let elements = document.getElementsByClassName('Icon--retweet');
                            elements[0].click()
                        });


                        await page.waitFor(2000)
                        let _RETWEETS_SPAN = await page.$('.RetweetDialog-retweetActionLabel')
                        _RETWEETS_SPAN.click()

                        await page.screenshot({ path: elem + ' ' + colleges[elem].username + '.png' }).then(console.log('🤞 I have kept my promise to screenshot ' + colleges[elem].password))
                    } catch (err) {
                        console.log('Sorry! I couldn\'t keep my promise to screenshot ' + colleges[elem].username)
                    }
                }))
            }
        }

        // await promise all and close browser
        await Promise.all(promises)
        await browser.close()

        console.log('\nI finished this batch. I\'m ready for the next batch');
    }
}

tweeeets(colleges, parallel)