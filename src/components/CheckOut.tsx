import { Button } from "flowbite-react";

export default function CheckOutInfo({type}: {type: "inrange" | "outrange"}) {
    return (
        <>
        {type === "inrange" && (    
        <div className="w-full flex justify-between items-center  max-w-2xl bg-green-200 p-4 rounded-full px-5 ">
            <div>
            <h1 className="text-xl font-bold">Anda sedang menggunakan B 123 AF</h1>
            <p className="text-sm text-gray-500">
                Silakan kembalikan kendaraan setelah selesai menggunakannya.
            </p>
            </div>
            <div>
                <Button pill color="alternative" className="px-5">Kembalikan Kendaraan</Button>
            </div>
        </div> 
        )}
        {type === "outrange" && (
            <div className="w-full flex justify-between items-center  max-w-2xl bg-red-200 p-4 rounded-full px-5 ">
                <div>
                    <h1 className="text-xl font-bold">B 123 AF melewati jam penggunaan </h1>
                    <p className="text-sm text-gray-500">
                        Silakan kembalikan kendaraan.
                    </p>
                </div>
                <div>
                    <Button pill color="red" className="px-5">Kembalikan Kendaraan</Button>
                </div>
            </div>
        )}
        </>
    )
}