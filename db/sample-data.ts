import { createActivity, createSyncedObject, createUser, getUser, STATIC_USER } from "./queries";

const sampleRecordData = [
  {
    "id": "51ceacf9-6572-592e-99b8-c4ff32ad10a1",
    "external_id": "1kfrvDN3SPpY30Dli_TLphL45iiFHE-QPtsnAN5KKPpo",
    "name": "developers.cloudflare.com_autorag_.md",
    "mime_type": "application/vnd.google-apps.document",
    "size": null,
    "url": "https://docs.google.com/document/d/1kfrvDN3SPpY30Dli_TLphL45iiFHE-QPtsnAN5KKPpo/edit?usp=drivesdk",
    "thumbnail_url": "https://lh3.googleusercontent.com/drive-storage/AJQWtBOZtm4Zk-QN-Gslo4UK49Cpu1UWW_bIJFU4HrZtGX8Zkguc5n_beCQSTA8lOFKY3ugsvY7byNKbfXw-ztRta15J4mEUXg9Mdzzhiy_O-yRfOlugJGvCD0nZ_CkT7w=s220",
    "created_at": 1499208182269,
    "updated_at": 1515802745476,
    "hash": {
      "type": "MD5"
    }
  },
  {
    "id": "ad0e9fc2-56e4-5b66-96e9-c8fc29495c6e",
    "external_id": "1OsyHTp4VEei0UR0TFKtyNxK_64UQn8HdpVH6Q5ibPGg",
    "name": "developers.cloudflare.com_autorag_concepts_.md",
    "mime_type": "application/vnd.google-apps.spreadsheet",
    "size": null,
    "url": "https://docs.google.com/spreadsheets/d/1OsyHTp4VEei0UR0TFKtyNxK_64UQn8HdpVH6Q5ibPGg/edit?usp=drivesdk",
    "thumbnail_url": "https://lh3.googleusercontent.com/drive-storage/AJQWtBOwE87901JD1zz5AhnRpLehjLH3N9fs5rzQWV_f7Rzh8ucrSGN56hFc8h_te6WJYN6ayhyV-kMXj-cEis3t-s0NMLuog7z-00OcgsVKRni-kd5E4QmTFBrslZRgmg=s220",
    "created_at": 1515816339021,
    "updated_at": 1515829460008,
    "hash": {
      "type": "MD5"
    }
  },
  {
    "id": "a00cc604-54b8-5831-ae46-ad8bf8275956",
    "external_id": "12SGZoIbzFlfMs3qSoQpqyrKk_aifwV69ElfWY02B7pI",
    "name": "developers.cloudflare.com_autorag_concepts_how-autorag-works_.md",
    "mime_type": "application/vnd.google-apps.spreadsheet",
    "size": null,
    "url": "https://docs.google.com/spreadsheets/d/12SGZoIbzFlfMs3qSoQpqyrKk_aifwV69ElfWY02B7pI/edit?usp=drivesdk",
    "thumbnail_url": "https://lh3.googleusercontent.com/drive-storage/AJQWtBP4m5iHQUv96mK5jiadFRdofPi7jUZmUE46kbOdn-Pj57jV69jx3TZ3-H4WzVePoHijjmk4LZrbzF0GVIZwbRS_RLdK6DzVo93R_zQdQjfV1lZ4r2AMR06Ub6Fr5w=s220",
    "created_at": 1537628996089,
    "updated_at": 1582063866693,
    "hash": {
      "type": "MD5"
    }
  },
  {
    "id": "64040261-8ce4-596f-ab4d-29942641524b",
    "external_id": "11ruCNuOR7t25xM9ZUbx1ueZZr0mXaMhYoFZF905l1Bo",
    "name": "developers.cloudflare.com_autorag_concepts_what-is-rag_.md",
    "mime_type": "application/vnd.google-apps.spreadsheet",
    "size": null,
    "url": "https://docs.google.com/spreadsheets/d/11ruCNuOR7t25xM9ZUbx1ueZZr0mXaMhYoFZF905l1Bo/edit?usp=drivesdk",
    "thumbnail_url": "https://lh3.googleusercontent.com/drive-storage/AJQWtBO_Dcft9vAdyjnvLBx6wHp6jBtgbKFFsNI5SUFf-75qRmNoNTSxJG2-MvfWNBDW4BcvEwRix7UIwGjgnGduKsjfTiWQKofxZ32Q3I9PKdBakt_QzIYnp7BYPuIWmg=s220",
    "created_at": 1537629694628,
    "updated_at": 1582063905406,
    "hash": {
      "type": "MD5"
    }
  },
  {
    "id": "554d78e7-87e7-571f-bf3a-b54d17cac08f",
    "external_id": "11OBy6SNZsyI30N_z2z_ZSieWryGFCVTd05OV2iKzZLY",
    "name": "developers.cloudflare.com_autorag_configuration_.md",
    "mime_type": "application/vnd.google-apps.spreadsheet",
    "size": null,
    "url": "https://docs.google.com/spreadsheets/d/11OBy6SNZsyI30N_z2z_ZSieWryGFCVTd05OV2iKzZLY/edit?usp=drivesdk",
    "thumbnail_url": "https://lh3.googleusercontent.com/drive-storage/AJQWtBOAN0RJWRWYo1BHO8a57evyNZq---UJKjyctF0I0-OTjjN2ywoYdOT-k-WmLGm_fcbN9kaqAtTs4E8BiVPUGgKqwEUvEgAhr3UNUilAYI86O58CW7twpdCObZroFA=s220",
    "created_at": 1554467774120,
    "updated_at": 1597623683986,
    "hash": {
      "type": "MD5"
    }
  },
];

const sampleActivityData = [
  {
    "id": "04c73f3a-bbb6-535e-bbba-a758f6256323",
    "source": "googledrive",
    "event": "sync_triggered",
    "receivedAt": 1515829460008,
    "data": {
      "pipeline": "files"
    }
  },
  {
    "id": "123abuea-bbb6-535e-bbba-a758f6256wei",
    "event": "sync_complete",
    "source": "googledrive",
    "receivedAt": 1515802745476,
    "data": {
      "model": "File",
      "synced_at": "2025-03-08T11:59:00Z",
      "num_records": 3921
    }
  }
]

export async function insertSampleData() {
  console.log("Inserting sample synced objects...");

  let actualUserId: string;
  try {
    let user = await getUser(STATIC_USER.email);
    if (!user || user.length === 0) {
      console.log("Creating static user...");
      await createUser(STATIC_USER.email, "static-user-password", STATIC_USER.id);
      user = await getUser(STATIC_USER.email);
      console.log("Static user created");
    } else {
      console.log("Static user already exists");
    }
    actualUserId = user[0].id;
    console.log(`Using user ID: ${actualUserId}`);
  } catch (error) {
    console.error("Failed to create static user:", error);
    return;
  }

  for (const record of sampleRecordData) {
    const data = JSON.stringify({
      name: record.name,
      mime_type: record.mime_type,
      size: record.size,
      url: record.url,
      thumbnail_url: record.thumbnail_url,
      hash: record.hash
    });

    try {
      await createSyncedObject({
        syncObjectId: record.id,
        externalId: record.external_id,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        userId: actualUserId,
        data,
        source: "googledrive"
      });
      console.log(`Inserted record: ${record.name}`);
    } catch (error) {
      console.error(`Failed to insert record ${record.name}:`, error);
    }
  }

  for (const record of sampleActivityData) {
    try {
      await createActivity({
        event: record.event,
        source: record.source,
        receivedAt: new Date(record.receivedAt),
        userId: actualUserId,
        data: JSON.stringify(record.data)
      });
      console.log(`Inserted record: ${record.event}`);
    } catch (error) {
      console.error(`Failed to insert record ${record.id}:`, error);
    }
    console.log("Sample data insertion complete!");
  }
}

// Run the script if called directly
if (require.main === module) {
  insertSampleData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error("Error inserting sample data:", error);
    process.exit(1);
  });
}
