package f2e;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.font.FontRenderContext;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class Draw {
    
    private int width = 300;
    private int height = 200;
    private Color bg = Color.GRAY;
    private Color fontColor = Color.WHITE;
    
    String fileName = "f2e/temp.jpg";
    File file = new File(fileName);
    
    public Draw(Integer w,Integer h,String bg, String fc) {
        this.width = w;
        this.height = h;
        this.bg = Color.decode("#"+bg);
        this.fontColor = Color.decode("#"+fc);
    }

    public Draw() {
    }

    private void render(){
        String str = width + "*" + height;
        
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = (Graphics2D) image.getGraphics();
        g2.setBackground(this.bg);
        g2.clearRect(0, 0, width, height);
        
        Font font = new Font("Microsoft Yahei", Font.CENTER_BASELINE, Math.max(width / 10, 12) );
        g2.setFont(font);
        g2.setPaint(fontColor);
        
        FontRenderContext context = g2.getFontRenderContext();
        Rectangle2D bounds = font.getStringBounds( str, context);
        double x = (width - bounds.getWidth()) / 2;
        double y = (height - bounds.getHeight()) / 2;
        double ascent = -bounds.getY();
        double baseY = y + ascent;
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        
        g2.drawString(str, (int) x, (int) baseY);
        
        try {
            ImageIO.write(image, "jpg", file);
            System.out.println("OK");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        Draw d = new Draw();
        if( args.length >= 4 ){
            d = new Draw(Integer.parseInt(args[0]),Integer.parseInt(args[1]),args[2],args[3]);
        }
        d.render();
    }
    
}
