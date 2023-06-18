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
            WriteLine("설치 경로 입력", ConsoleColor.Yellow);
            string path = Console.ReadLine();

            WriteLine("1. 백업 & 다운로드", ConsoleColor.Yellow);
            WriteLine("2. 복원", ConsoleColor.Yellow);
            string input = Console.ReadLine();

            if (input.Equals("1"))
                Routine_Download(path);
            else if (input.Equals("2"))
                Routine_Restore(path);
        }

        #region Routine
        void Routine_Download(string path)
        {
            if (!FileExistsCheck(path))
            {
                WriteLine("이미 백업된 파일이 있어 복구가 불가능합니다.", ConsoleColor.Red);
                return;
            }

            Backup(path);
            WriteLine("백업 완료", ConsoleColor.Green);

            FileDownload(path);
            WriteLine("설치 완료", ConsoleColor.Green);
        }

        void Routine_Restore(string path)
        {
            Restore(path);
            WriteLine("복원 완료", ConsoleColor.Green);
        }
        #endregion

        bool FileExistsCheck(string path)
        {
            List<string> list2 = new List<string>();

            foreach (var kvp in paths)
            {
                string b = path + kvp.Value + ".bak";

                if (File.Exists(b))
                    list2.Add(b);
            }

            Console.ForegroundColor = ConsoleColor.Red;
            foreach (var item in list2)
                Console.WriteLine("[이미 백업된 파일]    " + item);
            Console.ResetColor();
            
            return list2.Count == 0;
        }

        #region Backup / Restore
        void Backup(string path)
        {
            foreach (var kvp in paths)
            {
                string file = path + kvp.Value;
                string bakFile = file + ".bak";

                if (File.Exists(file))
                {
                    File.Move(file, bakFile);
                    WriteLine("[백업 완료]    " + bakFile, ConsoleColor.Green);
                }
            }
        }

        void Restore(string path)
        {
            foreach (var kvp in paths)
            {
                string file = path + kvp.Value;
                string bakFile = file + ".bak";

                if (File.Exists(file))
                    File.Delete(file);

                if (File.Exists(bakFile))
                {
                    File.Move(bakFile, file);
                    WriteLine("[복원 완료]    " + file, ConsoleColor.Green);
                }
            }
        }
        #endregion

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
