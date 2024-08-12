export const generateAvatarUrl = (nameInitial: string) => {
    const backgroundColors = ["5D73E2", "F1C40F", "B33871", "54A0FE", "2FCB82", "E84C3D"]
  
    const backgroundColor = backgroundColors[Math.floor(Math.random() * 6)]
  
    const textColor = "ffffff"
  
    const avatarUrl = `https://ui-avatars.com/api/?background=${backgroundColor}&color=${textColor}&name=${nameInitial}`
  
    return avatarUrl
  }
  