import "./App.css";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette";

// Hook untuk fetch master mapping dari Google Sheets
function useMasterMapping(sheetId: string, apiKey: string) {
  const [master, setMaster] = useState<Record<string, "A" | "B" | "C" | "D">>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:B100?key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        const newMaster: Record<string, "A" | "B" | "C" | "D"> = {};
        json.values?.forEach(([nama, grup]: [string, string]) => {
          if (nama && grup) {
            newMaster[nama.trim().toLowerCase()] = grup as
              | "A"
              | "B"
              | "C"
              | "D";
          }
        });

        setMaster(newMaster);
      } catch (err) {
        console.error("Gagal fetch master mapping:", err);
      }
    };

    fetchData();
  }, [sheetId, apiKey]);

  return master;
}

function App() {
  // Generate warna random
  function getRandomColor() {
    const colors = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"];
    // red-500, green-500, blue-500, yellow-500
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const SHEET_ID = "1-H58WXJQHkCdxpjkyBn2tyT25jTiMJ3bb3wM2JViN7s";
  const API_KEY = "AIzaSyD8COwpSbFUlxKi2Fel_gpxuXhmtC6Q824";

  const master = useMasterMapping(SHEET_ID, API_KEY);

  const [data, setData] = useState<
    { option: string; style: { backgroundColor: string; textColor: string } }[]
  >([]);
  const [newName, setNewName] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [groups, setGroups] = useState({
    A: [] as string[],
    B: [] as string[],
    C: [] as string[],
    D: [] as string[],
  });

  // 🔔 Popup
  const [announcement, setAnnouncement] = useState<{
    name: string;
    group: "A" | "B" | "C" | "D" | null;
    message?: string;
  } | null>(null);

  const handleSpinClick = () => {
    if (data.length === 0) return;
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleStop = () => {
    const winner = data[prizeNumber].option.trim().toLowerCase();

    const existingGroup =
      (groups.A.includes(winner) && "A") ||
      (groups.B.includes(winner) && "B") ||
      (groups.C.includes(winner) && "C") ||
      (groups.D.includes(winner) && "D") ||
      null;

    if (existingGroup) {
      setAnnouncement({
        name: winner,
        group: existingGroup,
        message: `Nama sudah ada di Grup ${existingGroup}, tidak dimasukkan lagi.`,
      });
    } else {
      let assignedGroup: "A" | "B" | "C" | "D";

      if (master[winner]) {
        assignedGroup = master[winner];
      } else {
        const counts = {
          A: groups.A.length,
          B: groups.B.length,
          C: groups.C.length,
          D: groups.D.length,
        };
        const minCount = Math.min(counts.A, counts.B, counts.C);

        const candidateGroups = (["A", "B", "C", "D"] as const).filter(
          (g) => counts[g] === minCount
        );

        assignedGroup =
          candidateGroups[Math.floor(Math.random() * candidateGroups.length)];
      }

      setAnnouncement({
        name: winner,
        group: assignedGroup,
      });
    }

    setMustSpin(false);
  };

  const handleExit = () => {
    if (!announcement) return;

    const winner = data[prizeNumber].option.trim().toLowerCase();
    const newGroups = { ...groups };

    if (announcement.group && !newGroups[announcement.group].includes(winner)) {
      newGroups[announcement.group].push(winner);
      setGroups(newGroups);
    }

    // hapus dari spinner
    const newData = data.filter((_, i) => i !== prizeNumber);
    setData(newData);

    // sinkronkan textarea juga
    setNewName(newData.map((item) => item.option).join("\n"));

    setAnnouncement(null);
  };

  // 🔑 sinkronisasi newName → data
  useEffect(() => {
    const names = newName
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    const newEntries = names.map((name) => {
      const existing = data.find(
        (item) => item.option.toLowerCase() === name.toLowerCase()
      );
      return (
        existing || {
          option: name,
          style: { backgroundColor: getRandomColor(), textColor: "#ffffff" },
        }
      );
    });

    setData(newEntries);
  }, [newName]);

  return (
    <div className="min-h-screen relative">
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 relative">
        {/* <h1 className="text-8xl text-clip bg-gradient-to-l from-gray-400 to-white font-bold">VIPBET99</h1> */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 bg-black/70 -z-10" />{" "}
        {/* overlay gelap */}
        {data.length > 0 ? (
          <>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              outerBorderWidth={0}
              radiusLineWidth={0}
              innerRadius={20}
              fontSize={38}
              data={data}
              spinDuration={0.5}
              onStopSpinning={handleStop}
            />
            <button
              onClick={handleSpinClick}
              className="mt-4 px-12 py-2 text-lg font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 disabled:bg-gray-400"
              disabled={mustSpin}
            >
              Spin
            </button>
          </>
        ) : (
          <p className="text-red-500 text-xl">
            Belum ada data. Silakan tambah nama dulu!
          </p>
        )}
        {/* Textarea sinkron */}
        <div className="absolute bg-gray-800/70 right-0 top-0 h-full p-4 flex flex-col justify-center items-start gap-2">
          <div className="flex flex-col gap-2 w-64">
            <textarea
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setNewName((prev) => prev + "\n");
                }
              }}
              spellCheck={false}
              className="mb-4 px-3 py-2 rounded bg-gray-600 text-white h-[40vh] resize-none"
              placeholder="Masukkan nama (satu per baris)"
            />
          </div>
        </div>
        {/* Tabel hasil */}
        {/* <div className="w-full max-w-3xl mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">
            Hasil Pembagian Grup
          </h2>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full border-collapse bg-white text-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  <th className="px-4 py-3 text-lg font-semibold">Grup A</th>
                  <th className="px-4 py-3 text-lg font-semibold">Grup B</th>
                  <th className="px-4 py-3 text-lg font-semibold">Grup C</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  {
                    length: Math.max(
                      groups.A.length,
                      groups.B.length,
                      groups.C.length
                    ),
                  },
                  (_, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-gray-600" : "bg-gray-600"}
                    >
                      <td className="px-4 py-2 capitalize text-white text-center">
                        {groups.A[i] || "-"}
                      </td>
                      <td className="px-4 py-2 capitalize text-white text-center">
                        {groups.B[i] || "-"}
                      </td>
                      <td className="px-4 py-2 capitalize text-white text-center">
                        {groups.C[i] || "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div> */}
        {/* Popup pengumuman */}
        {announcement && (
          <div className="fixed w-[1200px] h-[500px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-gray-200 p-6 rounded shadow-lg z-50">
            <h2 className="text-6xl font-bold mb-2 capitalize">
              {announcement.name}
            </h2>
            <p className="text-3xl">
              {announcement.message ? (
                <span className="text-red-600">{announcement.message}</span>
              ) : (
                <>
                  <span className="font-semibold">{announcement.group}</span>
                </>
              )}
            </p>

            <div className="mt-8 flex items-center">
              <button
                onClick={handleExit}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                OK
              </button>

              {/* <button
                onClick={() => setAnnouncement(null)}
                className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Tutup
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
