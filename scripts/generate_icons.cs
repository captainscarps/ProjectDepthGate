using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public class IconGenerator
{
    public static void Main(string[] args)
    {
        string srcPath = @"C:\Users\rafaelscarpille\.gemini\antigravity\brain\f32dd795-4fc4-4eee-a304-6a2759fd9a03\.user_uploaded\media_1792015070182_9071282c.jpg";
        string root = @"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate";
        string outDir = Path.Combine(root, "icons");
        Directory.CreateDirectory(outDir);
        Directory.CreateDirectory(Path.Combine(root, "Projeto atualizado", "icons"));

        using (Bitmap src = new Bitmap(srcPath))
        {
            Console.WriteLine("Source loaded: " + src.Width + "x" + src.Height);
            
            // 1. Generate PNGs
            int[] sizes = new int[] { 16, 32, 48, 64, 72, 96, 128, 144, 192, 256, 512 };
            foreach (int sz in sizes)
            {
                using (Bitmap resized = ResizeImage(src, sz, sz))
                {
                    resized.Save(Path.Combine(outDir, "icon-" + sz + ".png"), ImageFormat.Png);
                    if (sz == 192)
                    {
                        resized.Save(Path.Combine(outDir, "icon-192.png"), ImageFormat.Png);
                        resized.Save(Path.Combine(root, "Projeto atualizado", "icons", "icon-192.png"), ImageFormat.Png);
                    }
                    if (sz == 512)
                    {
                        resized.Save(Path.Combine(outDir, "icon-512.png"), ImageFormat.Png);
                        resized.Save(Path.Combine(outDir, "icon-512-maskable.png"), ImageFormat.Png);
                        resized.Save(Path.Combine(root, "Projeto atualizado", "icons", "icon-512.png"), ImageFormat.Png);
                        resized.Save(Path.Combine(root, "Projeto atualizado", "icons", "icon-512-maskable.png"), ImageFormat.Png);
                    }
                }
            }

            // 2. Generate Windows .ico
            string icoPath = Path.Combine(root, "app_icon.ico");
            CreateIco(src, new int[] { 16, 32, 48, 64, 128, 256 }, icoPath);
            Console.WriteLine("Generated .ico: " + icoPath);

            // 3. Generate Android mipmaps
            string apkIconsDir = Path.Combine(root, "scripts", "apk_icons");
            Directory.CreateDirectory(apkIconsDir);

            int[][] mipmaps = new int[][] {
                new int[] { 48, 0 },   // mdpi
                new int[] { 72, 1 },   // hdpi
                new int[] { 96, 2 },   // xhdpi
                new int[] { 144, 3 },  // xxhdpi
                new int[] { 192, 4 }   // xxxhdpi
            };
            string[] names = new string[] { "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi" };

            for (int i = 0; i < mipmaps.Length; i++)
            {
                int sz = mipmaps[i][0];
                string name = names[i];
                string d = Path.Combine(apkIconsDir, "mipmap-" + name + "-v4");
                Directory.CreateDirectory(d);

                using (Bitmap norm = ResizeImage(src, sz, sz))
                {
                    norm.Save(Path.Combine(d, "ic_launcher.png"), ImageFormat.Png);
                    norm.Save(Path.Combine(d, "ic_launcher_foreground.png"), ImageFormat.Png);
                }

                using (Bitmap round = CreateRoundImage(src, sz))
                {
                    round.Save(Path.Combine(d, "ic_launcher_round.png"), ImageFormat.Png);
                }
            }
            Console.WriteLine("Android mipmap icons generated!");
        }
    }

    static Bitmap ResizeImage(Image image, int width, int height)
    {
        var destRect = new Rectangle(0, 0, width, height);
        var destImage = new Bitmap(width, height, PixelFormat.Format32bppArgb);

        destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

        using (var graphics = Graphics.FromImage(destImage))
        {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.SmoothingMode = SmoothingMode.HighQuality;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

            using (var wrapMode = new ImageAttributes())
            {
                wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
            }
        }
        return destImage;
    }

    static Bitmap CreateRoundImage(Image image, int size)
    {
        Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.Clear(Color.Transparent);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            using (GraphicsPath gp = new GraphicsPath())
            {
                gp.AddEllipse(0, 0, size, size);
                g.SetClip(gp);
                using (Bitmap resized = ResizeImage(image, size, size))
                {
                    g.DrawImage(resized, 0, 0);
                }
            }
        }
        return bmp;
    }

    static void CreateIco(Bitmap src, int[] sizes, string outputPath)
    {
        using (FileStream fs = new FileStream(outputPath, FileMode.Create))
        using (BinaryWriter bw = new BinaryWriter(fs))
        {
            // ICONDIR
            bw.Write((short)0); // Reserved
            bw.Write((short)1); // Type 1 = ICO
            bw.Write((short)sizes.Length); // Image count

            int offset = 6 + (16 * sizes.Length);
            byte[][] pngBuffers = new byte[sizes.Length][];

            for (int i = 0; i < sizes.Length; i++)
            {
                int sz = sizes[i];
                using (Bitmap resized = ResizeImage(src, sz, sz))
                using (MemoryStream ms = new MemoryStream())
                {
                    resized.Save(ms, ImageFormat.Png);
                    pngBuffers[i] = ms.ToArray();
                }

                // ICONDIRENTRY
                bw.Write((byte)(sz >= 256 ? 0 : sz)); // Width
                bw.Write((byte)(sz >= 256 ? 0 : sz)); // Height
                bw.Write((byte)0); // Color count
                bw.Write((byte)0); // Reserved
                bw.Write((short)1); // Color planes
                bw.Write((short)32); // Bits per pixel
                bw.Write(pngBuffers[i].Length); // Size of image data
                bw.Write(offset); // Offset of image data
                offset += pngBuffers[i].Length;
            }

            for (int i = 0; i < sizes.Length; i++)
            {
                bw.Write(pngBuffers[i]);
            }
        }
    }
}
