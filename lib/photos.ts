// Local data URLs comply with our strict img-src policy; no blob URL is needed.
export async function compressPhoto(file:File):Promise<string>{
 if(file.size>30*1024*1024)throw Error('Cette photo dépasse 30 Mo. Choisissez une photo de 30 Mo maximum.');
 if(!file.size)throw Error('Cette photo est vide. Choisissez une autre image.');
 const source=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Lecture de la photo impossible.'));reader.readAsDataURL(file);});
 const image=new Image();image.src=source;
 try{await image.decode();}catch{throw Error('Ce format photo n’est pas lisible sur cet appareil. Exportez la photo en JPEG ou PNG, puis réessayez.');}
 if(!image.naturalWidth||!image.naturalHeight)throw Error('Photo illisible. Choisissez une autre image.');
 const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');if(!ctx)throw Error('Lecture de la photo impossible.');
 for(const side of [1200,1000,800,600,400]){const scale=Math.min(1,side/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);for(const quality of [.85,.7,.55,.4]){const data=canvas.toDataURL('image/jpeg',quality);if(data.startsWith('data:image/jpeg;base64,')&&data.length<=350000)return data;}}
 throw Error('La photo n’a pas pu être préparée. Essayez une autre image.');
}
