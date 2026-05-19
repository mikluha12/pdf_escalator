const dropZone = document.getElementById("dropZone");

const pdfInput = document.getElementById("pdfInput");

const selectBtn = document.getElementById("selectBtn");

const processBtn = document.getElementById("processBtn");

const fileList = document.getElementById("fileList");

const statusDiv = document.getElementById("status");

let selectedFiles = [];



selectBtn.addEventListener("click", () => {
    pdfInput.click();
});



pdfInput.addEventListener("change", (e) => {

    selectedFiles = [...e.target.files];

    updateFileList();
});



dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("dragover");
});



dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");
});



dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    const files = [...e.dataTransfer.files];

    selectedFiles = files.filter(file =>
        file.name.toLowerCase().endsWith(".pdf")
    );

    updateFileList();
});



function updateFileList(){

    fileList.innerHTML = "";

    if(selectedFiles.length === 0){

        fileList.innerHTML =
            "No hay PDFs seleccionados";

        return;
    }

    selectedFiles.forEach(file => {

        const div = document.createElement("div");

        div.className = "fileItem";

        div.textContent = "• " + file.name;

        fileList.appendChild(div);
    });
}



processBtn.addEventListener("click", async () => {

    if(selectedFiles.length === 0){

        alert("Selecciona PDFs primero");

        return;
    }

    for(const file of selectedFiles){

        statusDiv.textContent =
            "Procesando: " + file.name;

        try{

            const scale = 1.3;

            const arrayBuffer =
                await file.arrayBuffer();

            // PDF original
            const originalPdf =
                await PDFLib.PDFDocument.load(arrayBuffer);

            // PDF nuevo
            const newPdf =
                await PDFLib.PDFDocument.create();

            // Obtener primera página
            const originalPage =
                originalPdf.getPage(0);

            const width =
                originalPage.getWidth();

            const height =
                originalPage.getHeight();

            // EMBEBER página correctamente
            const embeddedPage =
                await newPdf.embedPage(originalPage);

            // Crear nueva hoja
            const newPage =
                newPdf.addPage([width, height]);

            // Dibujar escalada
            newPage.drawPage(embeddedPage, {

                x: 0,

                y: -(height * (scale - 1)),

                width: width * scale,

                height: height * scale
            });

            // Guardar PDF
            const pdfBytes =
                await newPdf.save();

            const blob = new Blob(
                [pdfBytes],
                { type: "application/pdf" }
            );

            // Descargar
            const link =
                document.createElement("a");

            link.href =
                URL.createObjectURL(blob);

            link.download =
                file.name.replace(".pdf", "")
                + "_130.pdf";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        }catch(error){

            console.error(error);

            alert(
                "Error procesando: "
                + file.name
            );
        }
    }

    statusDiv.textContent =
        "Procesamiento completado";
});