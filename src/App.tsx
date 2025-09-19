import "./App.css";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette";

// Hook untuk fetch master mapping dari Google Sheets
function useMasterMapping(sheetId: string, apiKey: string) {
  const [master, setMaster] = useState<Record<string, "A" | "B" | "C">>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:B100?key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        const newMaster: Record<string, "A" | "B" | "C"> = {};
        json.values?.forEach(([nama, grup]: [string, string]) => {
          if (nama && grup) {
            newMaster[nama.trim().toLowerCase()] = grup as "A" | "B" | "C";
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
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const SHEET_ID = "1-H58WXJQHkCdxpjkyBn2tyT25jTiMJ3bb3wM2JViN7s";
  const API_KEY = "AIzaSyD8COwpSbFUlxKi2Fel_gpxuXhmtC6Q824";

  const master = useMasterMapping(SHEET_ID, API_KEY);

  const [data, setData] = useState<
    { option: string; style: { backgroundColor: string; textColor: string } }[]
  >([]);
  const [newName, setNewName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [groups, setGroups] = useState({
    A: [] as string[],
    B: [] as string[],
    C: [] as string[],
  });

  // 🔔 Popup
  const [announcement, setAnnouncement] = useState<{
    name: string;
    group: "A" | "B" | "C" | null;
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

    // cek apakah sudah ada di grup
    const existingGroup =
      (groups.A.includes(winner) && "A") ||
      (groups.B.includes(winner) && "B") ||
      (groups.C.includes(winner) && "C") ||
      null;

    if (existingGroup) {
      // sudah ada, popup pesan khusus
      setAnnouncement({
        name: winner,
        group: existingGroup,
        message: `Nama sudah ada di Grup ${existingGroup}, tidak dimasukkan lagi.`,
      });
    } else {
      // assign grup baru
      let assignedGroup: "A" | "B" | "C";

      if (master[winner]) {
        assignedGroup = master[winner];
      } else {
        const counts = {
          A: groups.A.length,
          B: groups.B.length,
          C: groups.C.length,
        };
        const minCount = Math.min(counts.A, counts.B, counts.C);

        const candidateGroups = (["A", "B", "C"] as const).filter(
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

    // hanya tambahkan jika belum ada sebelumnya
    if (announcement.group && !newGroups[announcement.group].includes(winner)) {
      newGroups[announcement.group].push(winner);
      setGroups(newGroups);
    }

    // hapus dari spinner
    const newData = data.filter((_, i) => i !== prizeNumber);
    setData(newData);

    setAnnouncement(null);
  };

  const handleAddName = () => {
    const trimmedName = newName.trim();
    if (trimmedName === "") {
      setErrorMessage("Nama tidak boleh kosong!");
      return;
    }

    const isDuplicate = data.some(
      (item) => item.option.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage("Nama sudah ada di daftar!");
      return;
    }

    setData([
      ...data,
      {
        option: trimmedName,
        style: { backgroundColor: getRandomColor(), textColor: "#ffffff" },
      },
    ]);
    setNewName("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Spin Wheel Grup A-B-C</h1>

      {data.length > 0 ? (
        <>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStop}
          />
          <button
            onClick={handleSpinClick}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            disabled={mustSpin}
          >
            SPIN
          </button>
        </>
      ) : (
        <p className="text-red-500 font-semibold">
          Belum ada data. Silakan tambah nama dulu!
        </p>
      )}

      {/* Form tambah data */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border px-3 py-2 rounded w-64"
            placeholder="Masukkan nama"
          />
          <button
            onClick={handleAddName}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Tambah
          </button>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>

      {/* Tabel hasil */}
      <table className="border-collapse border border-gray-400 w-full max-w-2xl mt-6 text-center">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">Grup A</th>
            <th className="border border-gray-400 px-4 py-2">Grup B</th>
            <th className="border border-gray-400 px-4 py-2">Grup C</th>
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
              <tr key={i}>
                <td className="border border-gray-400 px-4 py-2">
                  {groups.A[i] || ""}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {groups.B[i] || ""}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {groups.C[i] || ""}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {/* Popup pengumuman */}
      {announcement && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-blue-500 p-6 rounded shadow-lg z-50">
          <h2 className="text-xl font-bold mb-2">Pengumuman!</h2>
          <p className="text-lg">
            Nama: <span className="font-semibold">{announcement.name}</span>
          </p>
          <p className="text-lg">
            {announcement.message ? (
              <span className="text-red-600">{announcement.message}</span>
            ) : (
              <>
                Masuk Grup:{" "}
                <span className="font-semibold">{announcement.group}</span>
              </>
            )}
          </p>

          <button
            onClick={handleExit}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            OK
          </button>

          <button
            onClick={() => setAnnouncement(null)}
            className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
