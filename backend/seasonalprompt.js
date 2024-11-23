const seasonalPrompts = [
    // 봄
    "vibrant colors, blooming flowers, fresh greenery",
    // 여름
    "golden sunlight, sparkling ocean, sandy shoreline",
    // 가을
    "golden leaves, maple trees, soft sunlight, crisp air",
    // 겨울
    "frosted trees, cool tones, icy branches, serene landscape, misty air",
    // 비
    "soft rain, overcast sky, puddles reflecting light",
    // 눈
    "falling snowflakes, quiet winter landscape, snow-covered ground"
 ];

function seasonBack( season ){
    switch(season){
        case 'spring' :
            return(seasonalPrompts[0]); break;
        case 'summer' :
            return(seasonalPrompts[1]); break;
        case 'autumn' :
            return(seasonalPrompts[2]); break;
        case 'winter' :
            return(seasonalPrompts[3]); break;
        case 'Rain' :
            return(seasonalPrompts[4]); break;
        case 'Snow' :
            return(seasonalPrompts[5]); break;
        default:
            return(seasonalPrompts[0]); break;
    }
}

module.exports = { seasonBack };