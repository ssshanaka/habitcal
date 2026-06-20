export interface WeatherData {
  temp: string;
  condition: string;
  isRainy: boolean;
  isSunny: boolean;
  isCloudy: boolean;
  isWindy: boolean;
}

export const fetchWeather = async (): Promise<WeatherData | null> => {
  try {
    // Using wttr.in with JSON format. 
    // format=j1 returns a large JSON. We'll parse it.
    const response = await fetch('https://wttr.in/?format=j1');
    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }
    const data = await response.json();
    
    const current = data.current_condition[0];
    const temp = current.temp_C;
    const condition = current.weatherDesc[0].value;
    
    // Simple heuristic for suggestions
    const conditionLower = condition.toLowerCase();
    const isRainy = conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower');
    const isSunny = conditionLower.includes('sun') || conditionLower.includes('clear');
    const isCloudy = conditionLower.includes('cloud') || conditionLower.includes('overcast');
    const isWindy = parseInt(current.windspeedKmph) > 20;

    return {
      temp,
      condition,
      isRainy,
      isSunny,
      isCloudy,
      isWindy
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
