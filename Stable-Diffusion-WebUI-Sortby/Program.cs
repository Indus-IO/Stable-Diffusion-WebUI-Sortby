using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stable_Diffusion_WebUI_Sortby
{
    internal class Program
    {
        Dictionary<string, string> paths = new Dictionary<string, string>()
        {
            { "ui_extra_networks_lora.py", @"\extensions-builtin\Lora\ui_extra_networks_lora.py" },

            { "ui_extra_networks.py", @"\modules\ui_extra_networks.py" },
            { "ui_extra_networks_checkpoints.py", @"\modules\ui_extra_networks_checkpoints.py" },
            { "ui_extra_networks_hypernets.py", @"\modules\ui_extra_networks_hypernets.py" },
            { "ui_extra_networks_textual_inversion.py", @"\modules\ui_extra_networks_textual_inversion.py" },
            { "processing.py", @"\modules\processing.py" },
            { "sd_models.py", @"\modules\sd_models.py" },


            { "extra-networks-card.html", @"\html\extra-networks-card.html" },

            { "extraNetworks.js", @"\javascript\extraNetworks.js" },
            { "recentlyLoader.js", @"\javascript\recentlyLoader.js" },
        };

        static void Main(string[] args)
        {
            new Program();

            Console.ReadLine();
        }

        public Program()
        {
            Console.WriteLine("설치 경로 입력");
            string path = Console.ReadLine();

            if(!FileExistsCheck(path))
            {
                WriteLine("설치 불가", ConsoleColor.Red);
                return;
            }

            FileBackup(path);
            WriteLine("백업 완료", ConsoleColor.Green);

            FileDownload(path);
            WriteLine("설치 완료", ConsoleColor.Green);
        }

        bool FileExistsCheck(string path)
        {
            List<string> list2 = new List<string>();

            foreach (var kvp in paths)
            {
                string a = path + kvp.Value;
                string b = path + kvp.Value + ".bak";

                if (File.Exists(b))
                    list2.Add(b);
            }

            Console.ForegroundColor = ConsoleColor.Red;
            foreach (var item in list2)
                Console.WriteLine("[존재하는 파일]    " + item);
            Console.ResetColor();
            
            return list2.Count == 0;
        }

        void FileBackup(string path)
        {
            foreach (var kvp in paths)
            {
                string source = path + kvp.Value;
                string dest = source + ".bak";
                
                if(File.Exists(source))
                    File.Move(source, dest);
            }
        }

        void FileDownload(string path)
        {
            foreach (var kvp in paths)
            {
                string dest = path + kvp.Value;

                File.WriteAllText(dest, File.ReadAllText(kvp.Key));
            }
        }

        void WriteLine(object obj, ConsoleColor color)
        {
            Console.ForegroundColor = color;
            Console.WriteLine(obj);
            Console.ResetColor();
        }
    }
}
