# Document AI

OP Vault uses the OP Stack (OpenAI + Pinecone Vector Database) to enable users to upload their own custom knowledgebase files and ask questions about their contents.

With quick setup, you can launch your own version of this Golang server along with a user-friendly React frontend that allows users to ask OpenAI questions about the specific knowledge base provided. The primary focus is on human-readable content like books, letters, and other documents, making it a practical and valuable tool for knowledge extraction and question-answering. You can upload an entire library's worth of books and documents and recieve pointed answers along with the name of the file and specific section within the file that the answer is based on!
## Manual Dependencies

-   node: v19
-   go: v1.18.9 darwin/arm64
-   poppler

### Install manual dependencies

1.  Install go:

Follow the go docs [here](https://go.dev/doc/install)

2.  Install node v19

I recommend [installing nvm and using it to install node v19](https://medium.com/@iam_vinojan/how-to-install-node-js-and-npm-using-node-version-manager-nvm-143165b16ce1)

3.  Install poppler

`sudo apt-get install -y poppler-utils` on Ubuntu, or `brew install poppler` on Mac

### Set up your API keys and endpoints in the `secret` folder

1.  Create a new file `secret/openai_api_key` and paste your [OpenAI API key](https://platform.openai.com/docs/api-reference/authentication) into it:

`echo "your_openai_api_key_here" > secret/openai_api_key`

2.  Create a new file `secret/pinecone_api_key` and paste your [Pinecone API key](https://docs.pinecone.io/docs/quickstart#2-get-and-verify-your-pinecone-api-key) into it:

`echo "your_pinecone_api_key_here" > secret/pinecone_api_key`

When setting up your pinecone index, use a vector size of `1536` and keep all the default settings the same.

3.  Create a new file `secret/pinecone_api_endpoint` and paste your [Pinecone API endpoint](https://app.pinecone.io/organizations/) into it:

`echo "https://example-50709b5.svc.asia-southeast1-gcp.pinecone.io" > secret/pinecone_api_endpoint`

### Running the development environment

1.  Install javascript package dependencies:

    `npm install`

2.  Run the golang webserver (default port `:8100`):

    `npm start`

3.  In another terminal window, run webpack to compile the js code and create a bundle.js file:

    `npm run dev`

4.  Visit the local version of the site at http://localhost:8100

## Under the hood

The golang server uses POST APIs to process incoming uploads and respond to questions:

1.  `/upload` for uploading files

2.  `/api/question` for answering questions

### Frontend info

The frontend is built using `React.js` and `less` for styling.

### Generative question-answering with long-term memory

If you'd like to read more about this topic, I recommend this post from the pinecone blog:

-   https://www.pinecone.io/learn/openai-gen-qa/

## Credits

[Vault AI](https://vault.pash.city/)
