kaboom({
    global:     true,
    fullscreen: true,
    scale:         1,
    debug:      true,
    clearColor: [0,0,0,1],
})

const SPEED = 120
const JUMP = 390
const MOVE_INIMIGO = 20
let IS_JUMPING = true
const FALL = 400

loadRoot('https://i.imgur.com/')
loadSprite('moeda', 'wbKxhcd.png')
loadSprite('inimigo', 'KPO3fR9.png')
loadSprite('tijolo', 'pogC9x5.png')
loadSprite('bloco', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('cogumelo', '0wMd92p.png')
loadSprite('surpresa', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-botton-left', 'c1cYSbt.png')
loadSprite('pipe-botton-right', 'nqQ79eI.png')

loadSprite('bloco-azul', 'fVscIbn.png')
loadSprite('tijolo-azul', '3e5YRQd.png')
loadSprite('steel-azul', 'gqVoI2b.png')
loadSprite('inimigo-azul', 'SvV4ueD.png')
loadSprite('surpresa-azul', 'RMqCc1G.png')


scene("game", ({level, score}) => {
    layer(['bg', 'obj','ui'], 'obj')

    const maps =[
        [
            '=                                    =',
            '=                                    =',
            '=                                    =',
            '=                                    =',
            '=                                    =',
            '=                                    =',
            '=                                    =',
            '=                                    =',
            '=        %    =*=%=                  =',
            '=                                    =',
            '=                           -+       =',
            '=                ^     ^    ()       =',
            '==============================  ======',
        ],
        [
            'x                                      x',
            'x                                      x',
            'x                                      x',
            'x                                      x',
            'x                                      x',
            'x                                      x',
            'x                                      x',
            'x                                      x',
            'x       @@@@@@                c        x',
            'x                           c c        x',
            'x                         c c c  c   -+x',
            'x               z    z  c c c c  c   ()x',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ]
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('bloco'), solid()],
        '$': [sprite('moeda') , 'moeda'],
        '%': [sprite('surpresa'), solid(), 'moeda-surpresa'],
        '*': [sprite('surpresa'), solid(), 'cogumelo-surpresa'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-botton-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-botton-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('inimigo'), solid(), 'inimigas'],
        '#': [sprite('cogumelo'), solid(), 'cogumelo', body()],
        
        '!': [sprite('bloco-azul'), solid(), scale(0.5)],
        'x': [sprite('tijolo-azul'), solid(), scale(0.5)],
        'z': [sprite('inimigo-azul'), solid(), scale(0.5), 'inimigas'],
        '@': [sprite('surpresa-azul'), solid(), scale(0.5), 'moeda-surpresa'],
        'c': [sprite('steel-azul'), solid(), scale(0.5)],
    }

    add([
        text('score '),pos(30,6)
    ])

    const scoreLabel = add([
        text(''),
        pos(78,6),
        layer('ui'),
        {
            value: score,
        }
    ])

    add([
        text('level ' + parseInt(level + 1)), 
        pos(30,20)
    ])

    function big(){
        let timer = 0
        let isBig = false
        return{
            update(){
                if(isBig){
                    timer -= dt()
                    if(timer <= 0){
                        this.smallify()
                    }
                }
            },
            
            isBig(){
                return isBig
            },
            
            smallify(){
                this.scale = vec2(1)
                timer = 0
                isBig = false
            },
            
            biggify(time){
                this.scale = vec2(2)
                timer = time
                isBig = true
            }
        }
    }


    const player = add([
        sprite('mario'), solid(),
        pos(30,0),
        body(),
        big(),
        origin('bot')
    ])

    action('cogumelo', (m)=>{
        m.move(25,0)
    })

    player.on("headbump", (obj) =>{
        if (obj.is('moeda-surpresa')){
            gameLevel.spawn('$', obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
        if (obj.is('cogumelo-surpresa')){
            gameLevel.spawn('#', obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
    })

    player.collides('cogumelo', (m) =>{
        destroy(m)
        player.biggify(6)
    })

    player.collides('moeda', (c) =>{
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    player.collides('inimigas', (d) =>{
        if(IS_JUMPING){
            destroy(d)
            scoreLabel.value++
            scoreLabel.text = scoreLabel.value
        }else{
            go('lose',{score: scoreLabel.value})
        }
    })

    action('inimigas', (d)=>{
        d.move(-MOVE_INIMIGO, 0)
    })

    player.action(() =>{
        if(player.grounded()){
            IS_JUMPING = false
        }
    })

    player.action(()=>{
       // camPos(player.pos)
        if(player.pos.y >= FALL){
            go('lose', {score: scoreLabel.value})
        }
    })

    player.collides('pipe', ()=>{
        keyPress('down', ()=>{
            go('game', {
                level: (level +1) % maps.length,
                score: scoreLabel.value
            })
        })
    })

    keyDown('left', ()=>{
        player.move(-SPEED,0)
    })

    keyDown('right', ()=>{
        player.move(SPEED, 0)
    })

    keyPress('up', ()=>{
        if(player.grounded()){
            IS_JUMPING = true
            player.jump(JUMP)
        }
    })


    const gameLevel = addLevel(maps[level], levelCfg, scoreLabel)
})

    scene('lose', ({score}) =>{
        add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
    })

start("game", {level: 0, score: 0})