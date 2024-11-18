const { rainItems, snowItems, springItems, summerItems, autumnItems, winterItems } = require('./fashion_item');

function selectItem(pty, season){
    if (pty === 'Rain') return randItem(rainItems);
    if (pty === 'Snow') return randItem(snowItems);
    else{
        switch(season){
        case 'spring' :
            return randItem(springItems); break;
        case 'summer' :
            return randItem(summerItems); break;
        case 'autumn' :
            return randItem(autumnItems); break;
        case 'winter' :
            return randItem(winterItems); break;
        default:
            return randItem(springItems); break;
        }
    }
}

function randItem(array){
    // 랜덤으로 배열 중의 하나를 선택해서 객체를 반환
    // { name: 영어이름, ko: 한국이름 }
    const num = Math.floor(Math.random()*(array.length));
    return array[num];
}

module.exports = { selectItem };