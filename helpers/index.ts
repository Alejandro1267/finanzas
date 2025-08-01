export const formatNumber$ = (value: number): string => {
    // Redondea a 2 decimales exactos
    const formattedDecimals = value.toFixed(2);
  
    // Separar parte entera y decimal
    const parts = formattedDecimals.split(".");
  
    // Dar formato a la parte entera con separadores de miles
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
    // Devolver el número completo con los 3 decimales
    return `$ ${parts[0]}.${parts[1]}`;
  };