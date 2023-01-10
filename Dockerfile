FROM node:14

WORKDIR /src

COPY . .

RUN npm install

#RUN npx prisma db pull

#RUN npx prisma generate

EXPOSE 5000

CMD npm start
