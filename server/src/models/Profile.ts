// models/Profile.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import User from './User';

interface ProfileAttributes {
  id: number;
  userId: number;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileCreationAttributes extends Optional<ProfileAttributes, 'id'> {}

class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  public id!: number;
  public userId!: number;
  public bio?: string;
  public avatarUrl?: string;

  // タイムスタンプ
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    bio: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    avatarUrl: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'profiles',
    sequelize,
  }
);

// リレーションを定義
Profile.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
  as: 'user',
});

export default Profile;
