from PIL import Image

def remove_dark_background(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            r, g, b, a = item
            lum = (0.299 * r + 0.587 * g + 0.114 * b)
            # Make dark pixels transparent, keep bright pixels opaque
            alpha = int(max(0, min(255, (lum - 10) * 3)))
            newData.append((r, g, b, alpha))
            
        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

remove_dark_background("public/logo.png", "public/logo-transparent.png")
