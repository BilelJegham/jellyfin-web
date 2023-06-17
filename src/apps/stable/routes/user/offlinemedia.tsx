import React, { FunctionComponent, useEffect, useState } from 'react';

import globalize from '../../../../scripts/globalize';
import Page from '../../../../components/Page';
import PouchDB from 'pouchdb-browser';

const OfflineMedias: FunctionComponent = () => {
    const [blobUrl, setBlobUrl] = useState<string>('');
    const [allDocs, setAllDocs] = useState<any[]>([]);
    const [db, setDb] = useState<PouchDB.Database>();
    async function fetchData() {
        const pouchDb = new PouchDB('offline_videos', { auto_compaction:true });
        setDb(pouchDb);
        const result = await pouchDb.allDocs({ include_docs: true, descending: true });
        setAllDocs(result.rows);
    }
    useEffect(() => {
        fetchData();
    }, []);

    async function setBlob(doc: any) {
        if (!db) return;
        const video = await db.getAttachment(doc.id, 'video') as Blob;
        console.log(video);
        const url = window.webkitURL;
        setBlobUrl(url.createObjectURL(video));
    }

    async function removeDocument(doc: any) {
        if (!db) return;
        await db.remove(doc.doc);
        await fetchData();
    }

    async function removeDatabase() {
        await db?.destroy();
        setAllDocs([]);
    }
    // TODO: use real jellyfin player
    return (
        <Page
            id='offlineMediaPage'
            title={globalize.translate('OfflineMedias')}
            className='mainAnimatedPage libraryPage noSecondaryNavPage'
        >
            {
                allDocs.map((doc: any)=> {
                    return <div key={doc.id} >

                        {doc.doc.title}
                        <button onClick={()=> setBlob(doc)}>
                            Play
                        </button>
                        <button onClick={()=> removeDocument(doc)}>
                            Remove
                        </button>
                    </div>
                    ;
                })
            }
            <button onClick={removeDatabase}>Remove All</button>
            {
                blobUrl && (
                    <video
                        controls
                        src={blobUrl}
                    />
                )
            }

        </Page>

    );
};

export default OfflineMedias;
