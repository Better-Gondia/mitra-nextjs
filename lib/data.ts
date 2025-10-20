import { User } from "@/types";

export const initUserData: User = {
  name: "",
  age: 0,
  gender: "Other",
  // authStep: "language",
  // language: "english",
  mobile: "0",
  address: "",
};

export const languageData = [];

export const dummyData = {
  success: true,
  data: {
    complaints: [
      {
        id: 29,
        complaintId: "29",
        userId: 1,
        title: "ddddd",
        description: "ddddd",
        category: "roads",
        location: null,
        latitude: null,
        longitude: null,
        status: "pending",
        media: [
          {
            url: "https://d2jow4rnitzfmr.cloudfront.net/668dc7f3-68d3-4879-bdb3-b9b92301e0c5_Comfortweatherjapantokyorain.mp4",
            filename: "Comfortweatherjapantokyorain.mp4",
            extension: "mp4",
            type: "video",
          },
        ],
        isMediaApproved: true,
        isPublic: true,
        coSignCount: 0,
        createdAt: "2025-07-14T17:49:35.414Z",
        updatedAt: "2025-07-17T21:34:24.862Z",
        messages:
          '[{"id":0,"content":"Hi! I\'m here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:39:43.292Z"},{"id":1752514785466,"content":"Please select the category for your complaint:","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:39:45.466Z"},{"id":1752515262658,"userId":1,"content":"🛣️ Roads & Traffic","messageType":"user","isRead":false,"createdAt":"2025-07-14T17:47:42.658Z"},{"id":1752515264163,"content":"Perfect! Now please describe your complaint in detail. Explain what exactly is the problem, when you noticed it, and how it\'s affecting you or your community.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:47:44.163Z"},{"id":1752515267302,"userId":1,"content":"ddddd","messageType":"user","isRead":false,"createdAt":"2025-07-14T17:47:47.302Z"},{"id":1752515268819,"content":"Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:47:48.819Z"},{"id":1752515271787,"content":"Location skipped. Would you like to add a photo or video?","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:47:51.787Z"},{"id":1752515335462,"content":"**Complaint Preview:**\\n- Issue: ddddd\\n- Category: roads\\n- Location: Not specified\\n- Your Details: Dheeraj Manwani • +91 9340291210\\n\\nWould you like to submit this complaint?\\n    ","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:48:55.462Z"},{"id":1752515376212,"content":"✅ Complaint submitted successfully! Your complaint ID is GK-140725-0029. We\'ll keep you updated on the progress.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:49:36.212Z"},{"id":1752515376212,"content":"Call to action (to be framed in requirement).","messageType":"bot","isRead":false,"createdAt":"2025-07-14T17:49:36.212Z"}]',
      },
      {
        id: 28,
        complaintId: "28",
        userId: 2,
        title: "Ghbb yuik egj",
        description: "Ghbb yuik egj",
        category: "water",
        location: "Thjnfs",
        latitude: null,
        longitude: null,
        status: "pending",
        media: [
          {
            url: "https://d2jow4rnitzfmr.cloudfront.net/0921ed6d-c3ad-436f-bf76-ec034657ebf0_IMG3533.jpeg",
            filename: "IMG3533.jpeg",
            extension: "jpeg",
            type: "image",
          },
          {
            url: "https://d2jow4rnitzfmr.cloudfront.net/3072bc8f-e0ca-4768-98b4-78edb3c4935e_IMG3534.jpeg",
            filename: "IMG3534.jpeg",
            extension: "jpeg",
            type: "image",
          },
        ],
        isMediaApproved: false,
        isPublic: true,
        coSignCount: 0,
        createdAt: "2025-07-14T15:45:27.462Z",
        updatedAt: "2025-07-14T15:45:27.507Z",
        messages:
          '[{"id":0,"content":"Hi! I\'m here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:44:00.444Z"},{"id":1752507855240,"content":"Please select the category for your complaint:","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:44:15.240Z"},{"id":1752507856425,"userId":2,"content":"💧 Water Supply","messageType":"user","isRead":false,"createdAt":"2025-07-14T15:44:16.425Z"},{"id":1752507857926,"content":"Perfect! Now please describe your complaint in detail. Explain what exactly is the problem, when you noticed it, and how it\'s affecting you or your community.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:44:17.926Z"},{"id":1752507892784,"userId":2,"content":"Ghbb yuik egj","messageType":"user","isRead":false,"createdAt":"2025-07-14T15:44:52.784Z"},{"id":1752507894285,"content":"Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:44:54.285Z"},{"id":1752507898262,"content":"Please type the address or location of the issue:","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:44:58.262Z"},{"id":1752507901030,"userId":2,"content":"Thjnfs","messageType":"user","isRead":false,"createdAt":"2025-07-14T15:45:01.030Z"},{"id":1752507902532,"content":"Great! Would you like to add a photo or video to help illustrate the issue? You can also skip this step.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:45:02.532Z"},{"id":1752507920901,"content":"**Complaint Preview:**\\n- Issue: Ghbb yuik egj\\n- Category: water\\n- Location: Thjnfs\\n- Your Details: Dheeraj Manwani • +91 09340291210\\n\\nWould you like to submit this complaint?\\n    ","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:45:20.901Z"},{"id":1752507927504,"content":"✅ Complaint submitted successfully! Your complaint ID is GK-140725-0028. We\'ll keep you updated on the progress.","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:45:27.504Z"},{"id":1752507927504,"content":"Call to action (to be framed in requirement).","messageType":"bot","isRead":false,"createdAt":"2025-07-14T15:45:27.504Z"}]',
      },
      {
        id: 27,
        complaintId: "27",
        userId: 17,
        title:
          "No street lights in the road between BJ Hospital back side and Vivek mandir school ",
        description:
          "No street lights in the road between BJ Hospital back side and Vivek mandir school ",
        category: "electricity",
        location: null,
        latitude: null,
        longitude: null,
        status: "pending",
        media: [],
        isMediaApproved: true,
        isPublic: true,
        coSignCount: 0,
        createdAt: "2025-07-13T21:33:58.852Z",
        updatedAt: "2025-07-17T21:28:37.316Z",
        messages:
          '[{"id":0,"content":"Hi! I\'m here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:27:16.852Z"},{"id":1752442127907,"content":"Please select the category for your complaint:","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:28:47.907Z"},{"id":1752442173825,"userId":17,"content":"⚡ Electricity","messageType":"user","isRead":false,"createdAt":"2025-07-13T21:29:33.825Z"},{"id":1752442175326,"content":"Perfect! Now please describe your complaint in detail. Explain what exactly is the problem, when you noticed it, and how it\'s affecting you or your community.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:29:35.326Z"},{"id":1752442382529,"userId":17,"content":"No street lights in the road between BJ Hospital back side and Vivek mandir school ","messageType":"user","isRead":false,"createdAt":"2025-07-13T21:33:02.529Z"},{"id":1752442384031,"content":"Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:33:04.031Z"},{"id":1752442405166,"content":"Location skipped. Would you like to add a photo or video?","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:33:25.166Z"},{"id":1752442418996,"content":"**Complaint Preview:**\\n- Issue: No street lights in the road between BJ Hospital back side and Vivek mandir school \\n- Category: electricity\\n- Location: Not specified\\n- Your Details: Dr Vikas Jain Jain • +91 9823278833\\n\\nWould you like to submit this complaint?\\n    ","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:33:38.996Z"},{"id":1752442438912,"content":"✅ Complaint submitted successfully! Your complaint ID is GK-130725-0027. We\'ll keep you updated on the progress.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:33:58.912Z"},{"id":1752442438912,"content":"Call to action (to be framed in requirement).","messageType":"bot","isRead":false,"createdAt":"2025-07-13T21:33:58.912Z"}]',
      },
      {
        id: 26,
        complaintId: "26",
        userId: 16,
        title: "Test description ",
        description: "Test description ",
        category: "sanitation",
        location: null,
        latitude: null,
        longitude: null,
        status: "pending",
        media: [],
        isMediaApproved: false,
        isPublic: true,
        coSignCount: 0,
        createdAt: "2025-07-13T20:05:16.756Z",
        updatedAt: "2025-07-13T20:05:16.793Z",
        messages:
          '[{"id":0,"content":"Hi! I\'m here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:02:48.094Z"},{"id":1752437085392,"content":"Let\'s edit your complaint. Please select the category again:","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:04:45.392Z"},{"id":1752437085409,"content":"Please select the category for your complaint:","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:04:45.409Z"},{"id":1752437092709,"userId":16,"content":"🗑️ Sanitation","messageType":"user","isRead":false,"createdAt":"2025-07-13T20:04:52.709Z"},{"id":1752437094210,"content":"Perfect! Now please describe your complaint in detail. Explain what exactly is the problem, when you noticed it, and how it\'s affecting you or your community.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:04:54.210Z"},{"id":1752437103672,"userId":16,"content":"Test description ","messageType":"user","isRead":false,"createdAt":"2025-07-13T20:05:03.672Z"},{"id":1752437105173,"content":"Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:05:05.173Z"},{"id":1752437112347,"content":"Location skipped. Would you like to add a photo or video?","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:05:12.347Z"},{"id":1752437115480,"content":"**Complaint Preview:**\\n- Issue: Test description \\n- Category: sanitation\\n- Location: Not specified\\n- Your Details: Priyal  • +91 7020794882\\n\\nWould you like to submit this complaint?\\n    ","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:05:15.480Z"},{"id":1752437116789,"content":"✅ Complaint submitted successfully! Your complaint ID is GK-130725-0026. We\'ll keep you updated on the progress.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:05:16.789Z"},{"id":1752437116789,"content":"Call to action (to be framed in requirement).","messageType":"bot","isRead":false,"createdAt":"2025-07-13T20:05:16.789Z"}]',
      },
      {
        id: 25,
        complaintId: "25",
        userId: 12,
        title: "hello",
        description: "hello",
        category: "roads",
        location: null,
        latitude: null,
        longitude: null,
        status: "pending",
        media: [],
        isMediaApproved: false,
        isPublic: true,
        coSignCount: 0,
        createdAt: "2025-07-13T18:15:47.502Z",
        updatedAt: "2025-07-13T18:15:47.606Z",
        messages:
          '[{"id":0,"content":"Hi! I\'m here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:14:50.728Z"},{"id":1752430492447,"content":"Please select the category for your complaint:","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:14:52.447Z"},{"id":1752430508915,"userId":12,"content":"🛣️ Roads & Traffic","messageType":"user","isRead":false,"createdAt":"2025-07-13T18:15:08.915Z"},{"id":1752430510417,"content":"Perfect! Now please describe your complaint in detail. Explain what exactly is the problem, when you noticed it, and how it\'s affecting you or your community.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:15:10.417Z"},{"id":1752430519577,"userId":12,"content":"hello","messageType":"user","isRead":false,"createdAt":"2025-07-13T18:15:19.577Z"},{"id":1752430521078,"content":"Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:15:21.078Z"},{"id":1752430528334,"content":"Location skipped. Would you like to add a photo or video?","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:15:28.334Z"},{"id":1752430535589,"content":"**Complaint Preview:**\\n- Issue: hello\\n- Category: roads\\n- Location: Not specified\\n- Your Details: jxjjx • +91 +91 9876543120\\n\\nWould you like to submit this complaint?\\n    ","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:15:35.589Z"},{"id":1752430547603,"content":"✅ Complaint submitted successfully! Your complaint ID is GK-130725-0025. We\'ll keep you updated on the progress.","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:15:47.603Z"},{"id":1752430547603,"content":"Call to action (to be framed in requirement).","messageType":"bot","isRead":false,"createdAt":"2025-07-13T18:15:47.603Z"}]',
      },
    ],
    count: 29,
  },
};
