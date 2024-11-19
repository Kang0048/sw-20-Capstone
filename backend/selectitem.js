const { rainItems, snowItems, springItems, summerItems, autumnItems, winterItems } = require('./fashion_item');

function selectItem(pty, season, userGender){
    if (pty === 'Rain') return randItem(rainItems);
    if (pty === 'Snow') return randItem(snowItems);
    else{
        switch(season){
            case 'spring' :
                if(userGender = 'male'){
                    return randItem(springItems.male); break;
                }else{
                    return randItem(springItems.female); break;
                }
            case 'summer' :
                if(userGender = 'male'){
                    return randItem(summerItems.male); break;
                }else{
                    return randItem(summerItems.female); break;
                }
                
            case 'autumn' :
                if(userGender = 'male'){
                    return randItem(autumnItems.male); break;
                }else{
                    return randItem(autumnItems.female); break;
                }
            case 'winter' :
                if(userGender = 'male'){
                    return randItem(winterItems.male); break;
                }else{
                    return randItem(winterItems.female); break;
                }   
            default:
                return randItem(springItems.female); break;
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