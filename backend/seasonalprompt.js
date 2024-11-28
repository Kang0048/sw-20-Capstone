const seasonalPrompts = [
    // 봄
    "cherry blossoms in bloom, fresh greenery, and soft sunlight",
    // 여름
    "golden sunlight, calm waves, and palm trees swaying gently",
    // 가을
    "golden leaves, red foliage, and warm sunlight filtering through",
    // 겨울
    "snow-covered ground, bare tree branch, and serene mist",
    // 비
    "gentle rain, small puddles, cloudy skies",
    // 눈
    "snowflakes falling, snowy rooftops, and a peaceful white landscape"
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