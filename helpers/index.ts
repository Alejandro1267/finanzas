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

export const fechaLocal = () => {
  const fechaLocal = new Date().toLocaleDateString("en-CA");
  return fechaLocal;
}

export const formatShortDate = (date: string) => {
  // Parse YYYY-MM-DD manually to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day); // month is 0-indexed
  
  const fechaLocal = dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short", 
    year: "numeric",
  });
  return fechaLocal;
}