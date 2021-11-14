const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
}
const Symbols = [
    'https://cdn-icons-png.flaticon.com/512/1/1438.png',

    // 'https://cdn-icons-png.flaticon.com/512/138/138454.png',
    'https://cdn-icons-png.flaticon.com/512/138/138533.png',

    // 'https://cdn-icons-png.flaticon.com/512/105/105212.png',
    'https://cdn-icons-png.flaticon.com/512/138/138534.png',
    'https://cdn-icons-png.flaticon.com/512/2316/2316793.png'
]


const view = {
    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number
        }
    },
    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        let style = ""
        console.log(Math.floor(index / 13))
        if ((Math.floor(index / 13) === 1) || (Math.floor(index / 13) === 2)) {
            style = "color:red"
        }
        return `<p style="${style}">${number}</p>
            <img src="${symbol}">
            <p style="${style}">${number}</p>`
    },
    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`
    },
    displayCards(indices) {
        const rootElement = document.querySelector('#cards')
        // utility.getRandomNumberArray(52)
        rootElement.innerHTML = indices
            .map(index => this.getCardElement(index))
            .join('')
    },
    flipCards(...cards) {
        cards.map(card => {
            if (card.classList.contains('back')) {
                // 回傳正面
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
            }
            // 回傳背面
            card.classList.add('back')
            card.innerHTML = null
        })


    },
    pairCards(...cards) {
        cards.map(card => {
            card.classList.add('paired')
        })

    },
    renderScore(score) {
        document.querySelector('.score').textContent = `Score: ${score}`
    },
    renderTriedTimes(times) {
        document.querySelector('.tried').textContent = `You've tried: ${times} times`
    },
    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event => {
                card.classList.remove('wrong')
            },
                {
                    once: true
                }
            )
        })

    },
    showGameFinished() {
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
            <p>Congratulations!</p>
            <img src="https://cdn-icons-png.flaticon.com/512/864/864800.png">
            <p>Score: ${model.score}</p>
            <p> You've tried: ${model.triedTimes} times</p>
        `
        const header = document.querySelector("#header")
        header.before(div)
    }
}


const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1))
                ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}

const model = {
    score: 0,
    triedTimes: 0,
    revealedCards: [],
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    }
}


const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardAction(card) {
        if (!card.classList.contains('back')) {
            return
        }

        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)
                if (model.isRevealedCardsMatched()) {
                    view.renderScore(model.score += 10)
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 260) {
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits
                } else {
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000)
                }
                break

        }

    },
    resetCards() {
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}

controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
        // view.showGameFinished()
    })
})
